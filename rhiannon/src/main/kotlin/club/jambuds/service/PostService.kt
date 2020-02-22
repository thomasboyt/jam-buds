package club.jambuds.service

import club.jambuds.dao.PostDao
import club.jambuds.dao.SongDao
import club.jambuds.model.SongWithMeta
import club.jambuds.model.User
import io.javalin.http.BadRequestResponse
import io.javalin.http.NotFoundResponse

class PostService(
    private val postDao: PostDao,
    private val songDao: SongDao,
    private val searchService: SearchService,
    private val twitterService: TwitterService,
    private val appUrl: String
) {
    fun createPostForSong(
        currentUser: User,
        spotifyId: String,
        tweetContent: String?
    ): SongWithMeta {
        val song = searchService.getOrCreateSong(spotifyId, currentUser)

        val existingPost =
            postDao.getUserPostForSongId(songId = song.id, userId = currentUser.id)
        if (existingPost != null) {
            throw BadRequestResponse("You have already posted this song")
        }

        postDao.createPost(userId = currentUser.id, songId = song.id)

        if (tweetContent != null) {
            val tweetLink = "$appUrl/users/${currentUser.name}?song=${song.id}"
            val tweetContentWithLink = "$tweetContent $tweetLink"
            twitterService.postTweet(currentUser, tweetContentWithLink)
        }

        return song
    }

    fun deleteSongPost(currentUser: User, songId: Int) {
        val post = postDao.getUserPostForSongId(songId = songId, userId = currentUser.id)
            ?: throw NotFoundResponse("No post found for user id ${currentUser.id} and song id $songId")

        postDao.deleteSongPost(userId = currentUser.id, songId = songId)
    }
}
