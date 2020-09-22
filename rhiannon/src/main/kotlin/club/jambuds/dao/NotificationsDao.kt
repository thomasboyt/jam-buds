package club.jambuds.dao

import club.jambuds.model.Notification
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
            (target_user_id, type, notification_user_id)
        VALUES
            (:followedUserId, 'follow', :newFollowerId)
        """
    )
    fun createFollowingNotification(followedUserId: Int, newFollowerId: Int)

    @SqlUpdate(
        """
        DELETE FROM notifications
        WHERE type = 'follow'
        AND target_user_id = :followedUserId
        AND notification_user_id = :followerId
        """
    )
    fun removeFollowingNotification(followedUserId: Int, followerId: Int)
}
