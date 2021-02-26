package club.jambuds.service

import club.jambuds.dao.LikeDao
import club.jambuds.dao.MixtapeDao
import club.jambuds.dao.SongDao
import club.jambuds.model.User
import club.jambuds.model.ItemType
import io.javalin.http.BadRequestResponse
import io.javalin.http.NotFoundResponse

class LikeService(
    private val likeDao: LikeDao,
    private val songDao: SongDao,
    private val mixtapeDao: MixtapeDao
) {
    fun createLike(currentUser: User, itemType: ItemType, itemId: Int) {
        val userId = currentUser.id

        if (likeDao.getLikeExists(userId = userId, itemType = itemType, itemId = itemId)) {
            throw BadRequestResponse("You have already a like for this $itemType")
        }

        if (itemType == ItemType.SONG) {
            if (!songDao.getSongExistsById(itemId)) {
                throw NotFoundResponse("Cannot find song with ID $itemId")
            }
        } else if (itemType == ItemType.MIXTAPE) {
            val mixtape = mixtapeDao.getMixtapeById(itemId)
                ?: throw NotFoundResponse("Cannot find mixtape with ID $itemId")
            if (mixtape.publishedAt == null) {
                throw BadRequestResponse("You can't like an unpublished mixtape")
            }
        }
        likeDao.createLike(userId = userId, itemType = itemType, itemId = itemId)
    }

    fun deleteLike(currentUser: User, itemType: ItemType, itemId: Int) {
        val userId = currentUser.id

        if (!likeDao.getLikeExists(userId = userId, itemType = itemType, itemId = itemId)) {
            throw NotFoundResponse("You do not have a like for this $itemType")
        }

        likeDao.deleteLike(userId = userId, itemType = itemType, itemId = itemId)
    }
}
