package club.jambuds.dao

import org.jdbi.v3.sqlobject.statement.SqlQuery
import org.jdbi.v3.sqlobject.statement.SqlUpdate

interface ReportDao {
    @SqlUpdate(
        "insert into post_reports (reporter_user_id, post_id) values (:reporterUserId, :postId)"
    )
    fun createReport(reporterUserId: Int, postId: Int)

    @SqlQuery(
        """
        SELECT EXISTS(
            SELECT * FROM post_reports WHERE reporter_user_id=:reporterUserId AND post_id=:postId
        )
        """
    )
    fun getReportExists(reporterUserId: Int, postId: Int): Boolean
}
