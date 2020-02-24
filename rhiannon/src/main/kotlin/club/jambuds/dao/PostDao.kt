package club.jambuds.dao

import club.jambuds.model.AggregatedPost
import club.jambuds.model.Post
import club.jambuds.model.mappers.AggregatedPostRowMapper
import org.jdbi.v3.sqlobject.config.RegisterRowMapper
import org.jdbi.v3.sqlobject.customizer.Bind
import org.jdbi.v3.sqlobject.locator.UseClasspathSqlLocator
import org.jdbi.v3.sqlobject.statement.GetGeneratedKeys
import org.jdbi.v3.sqlobject.statement.SqlQuery
import org.jdbi.v3.sqlobject.statement.SqlUpdate
import java.time.Instant

@UseClasspathSqlLocator
interface PostDao {
    @SqlQuery
    @RegisterRowMapper(AggregatedPostRowMapper::class)
    fun getPublicAggregatedPosts(
        @Bind("limit") limit: Int,
        @Bind("beforeTimestamp") beforeTimestamp: Instant?,
        @Bind("afterTimestamp") afterTimestamp: Instant?
    ): List<AggregatedPost>

    @SqlQuery
    @RegisterRowMapper(AggregatedPostRowMapper::class)
    fun getAggregatedPostsByUserFeed(
        currentUserId: Int,
        limit: Int,
        beforeTimestamp: Instant?,
        afterTimestamp: Instant?
    ): List<AggregatedPost>

    @SqlQuery
    fun getPostsForUserPlaylist(
        userId: Int,
        onlyMixtapes: Boolean,
        limit: Int,
        beforeTimestamp: Instant?,
        afterTimestamp: Instant?
    ): List<Post>

    @SqlUpdate
    @GetGeneratedKeys
    fun createPost(userId: Int, songId: Int): Post

    @SqlQuery
    fun getUserPostForSongId(userId: Int, songId: Int): Post?

    @SqlUpdate
    fun deleteSongPost(userId: Int, songId: Int)
}
