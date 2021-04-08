package club.jambuds.dao

import club.jambuds.model.Notification
import club.jambuds.model.NotificationType
import org.jdbi.v3.sqlobject.statement.SqlQuery
import org.jdbi.v3.sqlobject.statement.SqlUpdate

interface NotificationsDao {
    @SqlQuery("SELECT count(*) FROM notifications WHERE target_user_id = :userId AND read = false")
    fun getNewNotificationsCount(userId: Int): Int

    @SqlQuery(
        """
        SELECT *
        FROM notifications
        WHERE target_user_id = :userId AND read = false
        ORDER BY notifications.created_at DESC;
        """
    )
    fun getNewNotificationsByUserId(userId: Int): List<Notification>

    @SqlUpdate(
        """
        UPDATE notifications
        SET read = true
        WHERE target_user_id = :userId
        """
    )
    fun markAllReadForUserId(userId: Int)

    @SqlUpdate(
        """
        UPDATE notifications
        SET read = true
        WHERE id = :notificationId AND target_user_id = :userId
        """
    )
    fun markOneReadForUserId(notificationId: Int, userId: Int): Int

    @SqlUpdate(
        """
        INSERT INTO notifications
            (target_user_id, key, type, body, url, read)
        VALUES
            (:targetUserId, :key, :type, :body, :url, false)
        """
    )
    fun createNotification(
        targetUserId: Int,
        type: NotificationType,
        key: String,
        body: String,
        url: String,
    )

    @SqlUpdate(
        """
        DELETE FROM notifications
        WHERE type = :type
        AND target_user_id = :targetUserId
        AND key = :key
        """
    )
    fun removeNotification(targetUserId: Int, type: NotificationType, key: String)

    @SqlUpdate(
        """
        DELETE FROM notifications
        WHERE type = :type
        AND key = :key
        """
    )
    fun removeAnyTargetNotification(type: NotificationType, key: String)

}
