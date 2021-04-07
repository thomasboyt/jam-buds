package club.jambuds.service

import club.jambuds.dao.NotificationsDao
import club.jambuds.model.User
import club.jambuds.responses.NotificationItem
import io.javalin.http.NotFoundResponse

class NotificationService(private val notificationsDao: NotificationsDao, ) {
    fun getUnreadNotificationsByUserId(userId: Int): List<NotificationItem> {
        val notifications = notificationsDao.getNewNotificationsByUserId(userId)

        return notifications.map {
            NotificationItem(
                id = it.id,
                type = it.type,
                body = it.body,
                url = it.url,
                timestamp = it.createdAt,
                seen = it.read
            )
        }
    }

    fun markAllReadForUserId(userId: Int) {
        notificationsDao.markAllReadForUserId(userId)
    }

    fun markOneRead(notificationId: Int, user: User) {
        val numUpdated =
            notificationsDao.markOneReadForUserId(notificationId = notificationId, userId = user.id)
        if (numUpdated == 0) {
            throw NotFoundResponse(
                "No notification ID $notificationId found for user ID ${user.id}"
            )
        }
    }
}
