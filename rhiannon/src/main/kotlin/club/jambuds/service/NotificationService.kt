package club.jambuds.service

import club.jambuds.dao.NotificationsDao
import club.jambuds.dao.UserDao
import club.jambuds.model.NotificationType
import club.jambuds.responses.NotificationItem
import club.jambuds.responses.PublicUser

class NotificationService(
    private val notificationsDao: NotificationsDao,
    private val userDao: UserDao
) {
    fun getUnreadNotificationsByUserId(userId: Int): List<NotificationItem> {
        val notifications = notificationsDao.getNewNotificationsByUserId(userId)
        val userIds = notifications.mapNotNull { it.notificationUserId }
        val usersList = if (userIds.isNotEmpty()) {
            userDao.getUsersByIds(userIds)
        } else {
            emptyList()
        }
        val usersById = usersList.map { it.id to it }.toMap()

        return notifications.map {
            if (it.type == NotificationType.FOLLOW) {
                val user = usersById[it.notificationUserId!!]
                    ?: throw Error("No notificationUserId ${it.notificationUserId} found for notification ID ${it.id}")
                NotificationItem(
                    id = it.id,
                    type = it.type,
                    user = PublicUser(id = user.id, name = user.name)
                )
            } else {
                throw Error("Notification type not yet implemented: ${it.type}")
            }
        }
    }

    fun markAllReadForUserId(userId: Int) {
        notificationsDao.markAllReadForUserId(userId)
    }
}
