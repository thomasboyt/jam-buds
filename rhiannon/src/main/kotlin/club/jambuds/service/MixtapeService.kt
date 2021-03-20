package club.jambuds.service

import club.jambuds.dao.MixtapeDao
import club.jambuds.dao.SongDao
import club.jambuds.model.Mixtape
import club.jambuds.model.MixtapePreview
import club.jambuds.model.SongWithMeta
import club.jambuds.model.User
import club.jambuds.responses.MixtapeWithSongsReponse
import io.javalin.http.BadRequestResponse
import io.javalin.http.NotFoundResponse
import io.javalin.http.UnauthorizedResponse
import java.text.Normalizer
import java.util.Locale
import java.util.regex.Pattern

class MixtapeService(
    private val mixtapeDao: MixtapeDao,
    private val songDao: SongDao,
    private val userService: UserService,
    private val searchService: SearchService
) {
    fun createMixtape(title: String, currentUserId: Int): MixtapeWithSongsReponse {
        val userProfile = userService.getUserProfileByUserId(currentUserId)
            ?: throw Error("could not find user with id $currentUserId")

        val slug = toSlug(title)
        val mixtape = mixtapeDao.createMixtape(currentUserId, title, slug)
        val mixtapePreview = mixtapeDao.getMixtapePreviewById(mixtape.id, currentUserId)!!

        return MixtapeWithSongsReponse(
            mixtape = mixtapePreview,
            tracks = emptyList(),
            author = userProfile
        )
    }

    // via https://stackoverflow.com/a/1657250
    private val nonLatinRe = Pattern.compile("[^\\w-]")
    private val whitespaceRe = Pattern.compile("[\\s]")

    private fun toSlug(input: String): String {
        val nowhitespace = whitespaceRe.matcher(input).replaceAll("-")
        val normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD)
        val slug = nonLatinRe.matcher(normalized).replaceAll("")
        if (slug == "") {
            throw BadRequestResponse("Invalid slug: must have at least one alphanumeric character")
        }
        return slug.toLowerCase(Locale.ENGLISH)
    }

    fun getMixtapeById(id: Int, currentUserId: Int?): MixtapeWithSongsReponse? {
        val mixtape = mixtapeDao.getMixtapePreviewById(id, currentUserId) ?: return null

        // Users cannot access draft mixtapes that are not their own
        if (mixtape.publishedAt == null && mixtape.userId != currentUserId) {
            // TODO: log something here?
            return null
        }

        val songs = songDao.getSongsByMixtapeId(mixtape.id, currentUserId)

        val userProfile = userService.getUserProfileByUserId(mixtape.userId!!)
            ?: throw Error("could not find user with id ${mixtape.userId}")

        return MixtapeWithSongsReponse(
            mixtape = mixtape,
            tracks = songs,
            author = userProfile
        )
    }

    fun deleteMixtapeById(mixtapeId: Int, currentUserId: Int) {
        val mixtape = getMixtapeOr404(mixtapeId)

        if (currentUserId != mixtape.userId) {
            throw UnauthorizedResponse("You do not own this mixtape")
        }

        mixtapeDao.deleteMixtapeById(mixtapeId)
    }

    fun addSongToMixtape(mixtapeId: Int, currentUser: User, spotifyId: String): SongWithMeta {
        val mixtape = getMixtapeOr404(mixtapeId)
        ensureCanUpdateDraft(mixtape, currentUser)

        val songs = songDao.getSongsByMixtapeId(mixtape.id, currentUser.id)
        if (songs.any { it.spotifyId == spotifyId }) {
            throw BadRequestResponse("Mixtape already contains this song")
        }

        val song = searchService.getOrCreateSong(spotifyId, currentUser)
        mixtapeDao.addSongToMixtape(mixtapeId = mixtapeId, songId = song.id)
        return song
    }

    fun removeSongFromMixtape(mixtapeId: Int, songId: Int, currentUser: User) {
        val mixtape = getMixtapeOr404(mixtapeId)
        ensureCanUpdateDraft(mixtape, currentUser)
        mixtapeDao.removeSongFromMixtape(mixtapeId = mixtapeId, songId = songId)
    }

    fun reorderSongsInMixtape(mixtapeId: Int, songIds: List<Int>, currentUser: User) {
        val mixtape = getMixtapeOr404(mixtapeId)
        ensureCanUpdateDraft(mixtape, currentUser)
        mixtapeDao.reorderMixtapeSongs(mixtapeId = mixtapeId, songIds = songIds)
    }

    fun renameMixtape(mixtapeId: Int, title: String, currentUser: User): String {
        val mixtape = getMixtapeOr404(mixtapeId)
        ensureCanUpdateDraft(mixtape, currentUser)

        val slug = toSlug(title)
        mixtapeDao.renameMixtape(mixtapeId = mixtapeId, title = title, slug = slug)

        return slug
    }

    fun publishMixtape(mixtapeId: Int, currentUser: User) {
        val mixtape = getMixtapeOr404(mixtapeId)
        ensureCanUpdateDraft(mixtape, currentUser)
        mixtapeDao.publishMixtape(mixtapeId = mixtapeId, currentUserId = currentUser.id)
    }

    private fun getMixtapeOr404(mixtapeId: Int): Mixtape {
        return mixtapeDao.getMixtapeById(mixtapeId)
            ?: throw NotFoundResponse("No mixtape found with ID $mixtapeId")
    }

    private fun ensureCanUpdateDraft(mixtape: Mixtape, currentUser: User) {
        if (currentUser.id != mixtape.userId) {
            throw UnauthorizedResponse("You do not own this mixtape")
        }
        if (mixtape.publishedAt != null) {
            throw BadRequestResponse("Cannot update already published mixtape")
        }
    }

    fun getDraftMixtapesByUser(currentUser: User): List<MixtapePreview> {
        return mixtapeDao.getDraftMixtapePreviewsByUserId(currentUser.id)
    }
}
