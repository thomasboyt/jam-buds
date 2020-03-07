package club.jambuds.dao

import org.jdbi.v3.sqlobject.statement.SqlQuery

interface NotificationsDao {
    @SqlQuery("SELECT count(*) FROM notifications WHERE target_user_id = :userId AND read = false")
    fun getNewNotificationsCount(userId: Int): Int
}
