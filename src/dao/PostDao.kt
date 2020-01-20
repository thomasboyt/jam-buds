package dao

import org.jdbi.v3.sqlobject.statement.SqlQuery
import org.jdbi.v3.sqlobject.locator.UseClasspathSqlLocator
import model.AggregatedPost

@UseClasspathSqlLocator
interface PostDao {
    @SqlQuery
    fun getPublicAggregatedPosts(): List<AggregatedPost>
}