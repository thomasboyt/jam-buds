package club.jambuds.service

import club.jambuds.dao.AlbumDao
import club.jambuds.dao.LikeDao
import club.jambuds.dao.MixtapeDao
import club.jambuds.dao.NotificationsDao
import club.jambuds.dao.PostDao
import club.jambuds.dao.SongDao
import club.jambuds.dao.UserDao
import club.jambuds.model.User
import club.jambuds.model.ItemType
import club.jambuds.model.LikeSource
import club.jambuds.model.NotificationType
import io.javalin.http.BadRequestResponse
import io.javalin.http.NotFoundResponse
import org.slf4j.LoggerFactory

class LikeService(
    private val likeDao: LikeDao,
    private val songDao: SongDao,
    private val mixtapeDao: MixtapeDao,
    private val albumDao: AlbumDao,
    private val notificationsDao: NotificationsDao,
    private val userDao: UserDao,
    private val postDao: PostDao
) {
    private val logger = LoggerFactory.getLogger(AuthService::class.java.name)

    companion object {
        class LikeNotificationError(message: String): Exception(message)
    }

    fun createLike(
        currentUser: User,
        itemType: ItemType,
        itemId: Int,
        likeSource: LikeSource,
        sourceMixtapeId: Int?,
        sourceUserNames: String?
    ) {
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
        } else if (itemType === ItemType.ALBUM) {
            if (albumDao.getAlbumById(itemId) == null) {
                throw NotFoundResponse("Cannot find album with ID $itemId")
            }
        }

        likeDao.createLike(
            userId = userId,
            itemType = itemType,
            itemId = itemId
        )

        try {
            createLikeNotification(currentUser, itemType, itemId, likeSource, sourceMixtapeId, sourceUserNames)
        } catch (e: LikeNotificationError) {
            val logInfo = "(likeSource=$likeSource, sourceMixtapeId=$sourceMixtapeId, sourceUserNames=$sourceUserNames, itemType=$itemType, itemId=$itemId)"
            logger.warn("Error creating like notification: ${e.message} $logInfo")
            return
        }
    }

    fun createLikeNotification(
        currentUser: User,
        itemType: ItemType,
        itemId: Int,
        likeSource: LikeSource,
        sourceMixtapeId: Int?,
        sourceUserNames: String?
    ) {
        if (likeSource == LikeSource.MIXTAPE) {
            if (sourceMixtapeId == null) {
                throw LikeNotificationError("No sourcemixtapeId for a mixtape source")
            }
            if (itemType != ItemType.SONG) {
                throw LikeNotificationError("Can't like a non-song item on a mixtape source")
            }
            val mixtape = mixtapeDao.getMixtapeById(sourceMixtapeId)
            if (mixtape?.publishedAt == null) {
                throw LikeNotificationError("sourceMixtapeId not found")
            }
            if (mixtape.userId == currentUser.id) {
                return
            }
            val songs = songDao.getSongsByMixtapeId(mixtape.id)
            val song = songs.find { it.id == itemId }
                ?: throw LikeNotificationError("Song not in this mixtape")

            notificationsDao.createNotification(
                targetUserId = mixtape.userId,
                type = NotificationType.LIKE,
                key = "user:${currentUser.id},song:$itemId",
                body = "${currentUser.name} liked the song \"${song.title}\" via your mixtape \"${mixtape.title}\"",
                url = "/users/${currentUser.name}/liked"
            )
        } else if (likeSource == LikeSource.LIKE && itemType == ItemType.MIXTAPE) {
            // for liked mixtapes, just send the mixtape author a like notification.
            // we ignore other types of likes for now since "a user liked a song you liked" is
            // kinda goofy. maybe we could only do it for users who follow you?
            val mixtape = mixtapeDao.getMixtapeById(itemId)!!
            if (mixtape.userId == currentUser.id) {
                return
            }
            notificationsDao.createNotification(
                targetUserId = mixtape.userId,
                type = NotificationType.LIKE,
                key = "user:${currentUser.id},$itemType:$itemId",
                body = "${currentUser.name} liked your mixtape \"${mixtape.title}\"",
                url = "/users/${currentUser.name}/liked"
            )
        } else if (likeSource == LikeSource.POST) {
            if (sourceUserNames == null) {
                throw LikeNotificationError("No sourceUserNames present")
            }

            sourceUserNames.split(",").map {
                if (it == currentUser.name) {
                    return@map
                }
                val user = userDao.getUserByUserName(it)
                    ?: throw LikeNotificationError("Source user $it not found")

                postDao.getUserPostForItem(userId = user.id, itemType = itemType, itemId = itemId)
                    ?: throw LikeNotificationError("$it has not posted this item")

                val itemTitle = when (itemType) {
                    ItemType.SONG -> songDao.getSongsByIds(listOf(itemId))[0].title
                    ItemType.ALBUM -> albumDao.getAlbumById(itemId)!!.title
                    ItemType.MIXTAPE -> mixtapeDao.getMixtapeById(itemId)!!.title
                }
                val body = when {
                    likeSource == LikeSource.POST && itemType == ItemType.MIXTAPE -> {
                        "${currentUser.name} liked your mixtape \"$itemTitle\""
                    }
                    else -> {
                        "${currentUser.name} liked the $itemType \"${itemTitle}\" via your $likeSource"
                    }
                }
                notificationsDao.createNotification(
                    targetUserId = user.id,
                    type = NotificationType.LIKE,
                    key = "user:${currentUser.id},$itemType:$itemId",
                    body = body,
                    url = "/users/${currentUser.name}/liked"
                )
            }
        }
    }

    fun deleteLike(currentUser: User, itemType: ItemType, itemId: Int) {
        val userId = currentUser.id

        if (!likeDao.getLikeExists(userId = userId, itemType = itemType, itemId = itemId)) {
            throw NotFoundResponse("You do not have a like for this $itemType")
        }

        likeDao.deleteLike(userId = userId, itemType = itemType, itemId = itemId)
        notificationsDao.removeAnyTargetNotification(
            type = NotificationType.LIKE,
            key = "user:${currentUser.id},$itemType:$itemId",
        )
    }
}
