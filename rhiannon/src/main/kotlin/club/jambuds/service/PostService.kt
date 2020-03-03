package club.jambuds.service

import club.jambuds.dao.PostDao
import club.jambuds.model.SongWithMeta
import club.jambuds.model.User
import io.javalin.http.BadRequestResponse
import io.javalin.http.NotFoundResponse

class PostService(
    private val postDao: PostDao,
    private val searchService: SearchService,
    private val twitterService: TwitterService,
    private val appUrl: String
) {
    fun createPostForSong(
        currentUser: User,
        spotifyId: String,
        noteText: String?,
        postTweet: Boolean
    ): SongWithMeta {
        val song = searchService.getOrCreateSong(spotifyId, currentUser)

        val existingPost =
            postDao.getUserPostForSongId(songId = song.id, userId = currentUser.id)
        if (existingPost != null) {
            throw BadRequestResponse("You have already posted this song")
        }

        postDao.createPost(userId = currentUser.id, songId = song.id, note = noteText)

        if (postTweet) {
            val tweetContent = getTweetContent(currentUser, song, noteText)
            twitterService.postTweet(currentUser, tweetContent)
        }

        return song
    }

    fun deleteSongPost(currentUser: User, songId: Int) {
        if (postDao.getUserPostForSongId(songId = songId, userId = currentUser.id) == null) {
            throw NotFoundResponse("No post found for user id ${currentUser.id} and song id $songId")
        }

        postDao.deleteSongPost(userId = currentUser.id, songId = songId)
    }

    private fun getTweetContent(currentUser: User, song: SongWithMeta, noteText: String?): String {
        val tweetLink = "$appUrl/users/${currentUser.name}?song=${song.id}"

        return if (noteText == null) {
            "I just posted a song to Jam Buds! $tweetLink"
        } else {
            val noteContent = truncateNoteForTweet(noteText)
            "$noteContent $tweetLink"
        }
    }

    private fun truncateNoteForTweet(text: String): String {
        val tweetLength = 280
        val twitterUrlLength = 23
        val maxTextLength = tweetLength - twitterUrlLength - 1  // 1 for space between url and note
        if (text.length <= maxTextLength) {
            return text
        }

        val truncatedText = text.slice(0..(maxTextLength - 3))  // subtract three for ellipsis
        return "$truncatedText..."
    }
}
