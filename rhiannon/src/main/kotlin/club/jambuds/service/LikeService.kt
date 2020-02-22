package club.jambuds.service

import club.jambuds.dao.LikeDao
import club.jambuds.dao.SongDao
import club.jambuds.model.User
import io.javalin.http.BadRequestResponse
import io.javalin.http.NotFoundResponse

class LikeService(private val likeDao: LikeDao, private val songDao: SongDao) {
    fun createSongLike(currentUser: User, songId: Int) {
        val userId = currentUser.id

        if (!songDao.getSongExistsById(songId)) {
            throw NotFoundResponse("Cannot find song with ID $songId")
        }

        if (likeDao.getSongLikeExists(userId = userId, songId = songId)) {
            throw BadRequestResponse("You have already a like for this song")
        }

        likeDao.createSongLike(userId = userId, songId = songId)
    }

    fun deleteSongLike(currentUser: User, songId: Int) {
        val userId = currentUser.id

        if (!likeDao.getSongLikeExists(userId = userId, songId = songId)) {
            throw NotFoundResponse("You do not have a like for this song")
        }

        likeDao.deleteSongLike(userId = userId, songId = songId)
    }
}
