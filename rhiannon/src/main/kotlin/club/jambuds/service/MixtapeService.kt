package club.jambuds.service

import club.jambuds.dao.MixtapeDao
import club.jambuds.dao.SongDao
import club.jambuds.responses.MixtapeWithSongsReponse
import java.text.Normalizer
import java.util.Locale
import java.util.regex.Pattern

class MixtapeService(
    private val mixtapeDao: MixtapeDao,
    private val songDao: SongDao,
    private val userService: UserService
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

    // via https://stackoverflow.com/a/1657250
    private val nonLatinRe = Pattern.compile("[^\\w-]")
    private val whitespaceRe = Pattern.compile("[\\s]")

    private fun toSlug(input: String): String {
        val nowhitespace = whitespaceRe.matcher(input).replaceAll("-")
        val normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD)
        val slug = nonLatinRe.matcher(normalized).replaceAll("")
        return slug.toLowerCase(Locale.ENGLISH)
    }
}
