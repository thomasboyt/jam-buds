package club.jambuds.service

import club.jambuds.dao.MixtapeDao
import club.jambuds.dao.SongDao
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
        val slug = toSlug(title)
        val mixtape = mixtapeDao.createMixtape(currentUserId, title, slug)

        val userProfile = userService.getUserProfileByUserId(currentUserId)
            ?: throw Error("could not find user with id $currentUserId")

        return MixtapeWithSongsReponse(
            id = mixtape.id,
            title = mixtape.title,
            slug = mixtape.slug,
            isPublished = mixtape.publishedAt != null,
            publishedAt = mixtape.publishedAt,
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
        return slug.toLowerCase(Locale.ENGLISH)
    }

    fun getMixtapeById(id: Int, currentUserId: Int?): MixtapeWithSongsReponse? {
        val mixtape = mixtapeDao.getMixtapeById(id) ?: return null

        // Users cannot access draft mixtapes that are not their own
        if (mixtape.publishedAt == null && mixtape.userId != currentUserId) {
            // TODO: log something here?
            return null
        }

        val songs = songDao.getSongsByMixtapeId(mixtape.id, currentUserId)

        val userProfile = userService.getUserProfileByUserId(mixtape.userId)
            ?: throw Error("could not find user with id ${mixtape.userId}")

        return MixtapeWithSongsReponse(
            id = mixtape.id,
            title = mixtape.title,
            slug = mixtape.slug,
            isPublished = mixtape.publishedAt != null,
            publishedAt = mixtape.publishedAt,
            tracks = songs,
            author = userProfile
        )
    }

    fun deleteMixtapeById(mixtapeId: Int, currentUserId: Int) {
        val mixtape = mixtapeDao.getMixtapeById(mixtapeId)
            ?: throw NotFoundResponse("No mixtape found with ID $mixtapeId")

        if (currentUserId != mixtape.userId) {
            throw UnauthorizedResponse("You do not own this mixtape")
        }

        mixtapeDao.deleteMixtapeById(mixtapeId)
    }

    fun addSongToMixtape(mixtapeId: Int, currentUser: User, spotifyId: String): SongWithMeta {
        val mixtape = mixtapeDao.getMixtapeById(mixtapeId)
            ?: throw NotFoundResponse("No mixtape found with ID $mixtapeId")

        if (currentUser.id != mixtape.userId) {
            throw UnauthorizedResponse("You do not own this mixtape")
        }
        if (mixtape.publishedAt != null) {
            throw BadRequestResponse("Cannot add song to a published mixtape")
        }

        val songs = songDao.getSongsByMixtapeId(mixtape.id, currentUser.id)

        if (songs.any { it.spotifyId == spotifyId }) {
            throw BadRequestResponse("Mixtape already contains this song")
        }

        val song = searchService.getOrCreateSong(spotifyId, currentUser)
        mixtapeDao.addSongToMixtape(mixtapeId = mixtapeId, songId = song.id)
        return song
    }
}
