package club.jambuds.dao

import club.jambuds.model.Like
import org.jdbi.v3.sqlobject.locator.UseClasspathSqlLocator
import org.jdbi.v3.sqlobject.statement.SqlQuery
import java.time.Instant

@UseClasspathSqlLocator
interface LikeDao {
    @SqlQuery
    fun getLikesForUser(
        userId: Int,
        limit: Int,
        beforeTimestamp: Instant?,
        afterTimestamp: Instant?
    ): List<Like>
}
