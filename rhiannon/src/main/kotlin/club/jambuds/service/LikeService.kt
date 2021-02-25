package club.jambuds.service

import club.jambuds.dao.LikeDao
import club.jambuds.dao.SongDao
import club.jambuds.model.User
import club.jambuds.util.ItemType
import io.javalin.http.BadRequestResponse
import io.javalin.http.NotFoundResponse

class LikeService(private val likeDao: LikeDao, private val songDao: SongDao) {
    fun createLike(currentUser: User, itemType: ItemType, itemId: Int) {
        val userId = currentUser.id

        if (itemType == ItemType.SONG) {
            if (!songDao.getSongExistsById(itemId)) {
                throw NotFoundResponse("Cannot find song with ID $itemId")
            }

            if (likeDao.getSongLikeExists(userId = userId, songId = itemId)) {
                throw BadRequestResponse("You have already a like for this song")
            }

            likeDao.createSongLike(userId = userId, songId = itemId)
        } else {
            throw NotImplementedError()
        }
    }

    fun deleteLike(currentUser: User, itemType: ItemType, itemId: Int) {
        val userId = currentUser.id

        if (itemType == ItemType.SONG) {
            if (!likeDao.getSongLikeExists(userId = userId, songId = itemId)) {
                throw NotFoundResponse("You do not have a like for this song")
            }

            likeDao.deleteSongLike(userId = userId, songId = itemId)
        } else {
            throw NotImplementedError()
        }
    }
}
