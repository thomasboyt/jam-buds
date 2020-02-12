package club.jambuds.dao

import club.jambuds.model.AggregatedPost
import org.jdbi.v3.sqlobject.customizer.Bind
import org.jdbi.v3.sqlobject.locator.UseClasspathSqlLocator
import org.jdbi.v3.sqlobject.statement.SqlQuery
import java.time.Instant

@UseClasspathSqlLocator
interface PostDao {
    @SqlQuery
    fun getPublicAggregatedPosts(
        @Bind("limit") limit: Int,
        @Bind("beforeTimestamp") beforeTimestamp: Instant?,
        @Bind("afterTimestamp") afterTimestamp: Instant?
    ): List<AggregatedPost>

    @SqlQuery
    fun getAggregatedPostsByUserFeed(
        currentUserId: Int,
        limit: Int,
        beforeTimestamp: Instant?,
        afterTimestamp: Instant?
    ): List<AggregatedPost>
}
