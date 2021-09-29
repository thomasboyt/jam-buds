package club.jambuds.service

import club.jambuds.dao.AlbumDao
import club.jambuds.dao.MixtapeDao
import club.jambuds.dao.PostDao
import club.jambuds.dao.SongDao
import club.jambuds.dao.UserDao
import club.jambuds.model.AdminNotifyType
import club.jambuds.model.Post
import club.jambuds.model.User

class AdminNotifyService(
    private val userDao: UserDao,
    private val postDao: PostDao,
    private val albumDao: AlbumDao,
    private val songDao: SongDao,
    private val mixtapeDao: MixtapeDao,
    private val webhookService: AdminNotifyWebhookService
) {
    fun notifySignup(user: User) {
        val message = "*New user ${user.name} has signed up*"
        sendNotification(type = AdminNotifyType.SIGNUP, message = message)
    }

    fun notifyReport(fromUser: User, postId: Int) {
        val reportedPost = postDao.getPostById(postId)!!
        val reportedUser = userDao.getUserByUserId(reportedPost.userId)!!
        val formattedPost = formatPost(reportedPost)

        val message = """
            *New report from ${fromUser.name}:*
            User: ${reportedUser.name}
            Post: $formattedPost
            Note: ${reportedPost.note}
        """.trimIndent()

        sendNotification(type = AdminNotifyType.REPORT, message = message)
    }

    private fun formatPost(post: Post): String {
        return when {
            post.albumId !== null -> {
                val album = albumDao.getAlbumById(post.albumId)!!
                "Album - _*${album.title}_ by ${album.artists}"
            }
            post.songId !== null -> {
                val song = songDao.getSongById(post.songId)!!
                "Song - \"${song.title}\" by ${song.artists}"
            }
            post.mixtapeId !== null -> {
                val mixtape = mixtapeDao.getMixtapeById(post.mixtapeId)!!
                "Mixtape - *${mixtape.title}"
            }
            else -> {
                throw IllegalStateException("Missing one of album, song, or mixtape ID")
            }
        }
    }

    private fun sendNotification(type: AdminNotifyType, message: String) {
        webhookService.sendWebhook(type, message)
    }
}
