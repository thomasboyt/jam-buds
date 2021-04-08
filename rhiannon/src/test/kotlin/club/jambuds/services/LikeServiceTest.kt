package club.jambuds.services

import club.jambuds.AppTest
import club.jambuds.dao.AlbumDao
import club.jambuds.dao.LikeDao
import club.jambuds.dao.MixtapeDao
import club.jambuds.dao.NotificationsDao
import club.jambuds.dao.PostDao
import club.jambuds.dao.SongDao
import club.jambuds.dao.UserDao
import club.jambuds.helpers.TestDataFactories
import club.jambuds.model.ItemType
import club.jambuds.model.LikeSource
import club.jambuds.model.NotificationType
import club.jambuds.service.LikeService
import kotlin.test.assertEquals
import org.junit.jupiter.api.Test

class LikeServiceTest: AppTest() {
    private fun createLikeService(): LikeService {
        val likeDao = txn.attach(LikeDao::class.java)
        val songDao = txn.attach(SongDao::class.java)
        val mixtapeDao = txn.attach(MixtapeDao::class.java)
        val albumDao = txn.attach(AlbumDao::class.java)
        val notificationsDao = txn.attach(NotificationsDao::class.java)
        val userDao = txn.attach(UserDao::class.java)
        val postDao = txn.attach(PostDao::class.java)
        return LikeService(likeDao, songDao, mixtapeDao, albumDao, notificationsDao, userDao, postDao)
    }

    @Test
    fun `createLikeNotification - creates a notification for a liked song from a post`() {
        val likeService = createLikeService()
        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val vinny = TestDataFactories.createUser(txn, "vinny", true)
        val songId = TestDataFactories.createSong(txn, "abcdef")
        TestDataFactories.createSongPost(txn, vinny.id, songId)

        likeService.createLikeNotification(
            currentUser = jeff,
            itemType = ItemType.SONG,
            itemId = songId,
            likeSource = LikeSource.POST,
            sourceMixtapeId = null,
            sourceUserNames = "vinny"
        )

        val notificationsDao = txn.attach(NotificationsDao::class.java)
        val vinnyNotifications = notificationsDao.getNewNotificationsByUserId(vinny.id)
        assertEquals(1, vinnyNotifications.size)
        assertEquals(NotificationType.LIKE, vinnyNotifications[0].type)
    }

    @Test
    fun `createLikeNotification - creates a notification for a liked mixtape from a post`() {
        val likeService = createLikeService()
        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val vinny = TestDataFactories.createUser(txn, "vinny", true)
        val mixtapeId = TestDataFactories.createMixtape(txn, vinny.id, true)
        TestDataFactories.createMixtapePost(txn, vinny.id, mixtapeId)

        likeService.createLikeNotification(
            currentUser = jeff,
            itemType = ItemType.MIXTAPE,
            itemId = mixtapeId,
            likeSource = LikeSource.POST,
            sourceMixtapeId = null,
            sourceUserNames = "vinny"
        )

        val notificationsDao = txn.attach(NotificationsDao::class.java)
        val vinnyNotifications = notificationsDao.getNewNotificationsByUserId(vinny.id)
        assertEquals(1, vinnyNotifications.size)
        assertEquals(NotificationType.LIKE, vinnyNotifications[0].type)
    }

    @Test
    fun `createLikeNotification - creates a notification for a liked album from a post`() {
        val likeService = createLikeService()
        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val vinny = TestDataFactories.createUser(txn, "vinny", true)
        val album = TestDataFactories.createAlbum(txn)
        TestDataFactories.createAlbumPost(txn, vinny.id, album.id)

        likeService.createLikeNotification(
            currentUser = jeff,
            itemType = ItemType.ALBUM,
            itemId = album.id,
            likeSource = LikeSource.POST,
            sourceMixtapeId = null,
            sourceUserNames = "vinny"
        )

        val notificationsDao = txn.attach(NotificationsDao::class.java)
        val vinnyNotifications = notificationsDao.getNewNotificationsByUserId(vinny.id)
        assertEquals(1, vinnyNotifications.size)
        assertEquals(NotificationType.LIKE, vinnyNotifications[0].type)
    }
}
