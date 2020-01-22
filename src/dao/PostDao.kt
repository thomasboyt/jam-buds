package dao

import java.time.Instant
import org.jdbi.v3.sqlobject.statement.SqlQuery
import org.jdbi.v3.sqlobject.locator.UseClasspathSqlLocator
import model.AggregatedPost
import org.jdbi.v3.sqlobject.customizer.Bind

@UseClasspathSqlLocator
interface PostDao {
    @SqlQuery
    fun getPublicAggregatedPosts(
        @Bind("limit") limit: Int,
        @Bind("beforeTimestamp") beforeTimestamp: Instant?,
        @Bind("afterTimestamp") afterTimestamp: Instant?
    ): List<AggregatedPost>
}