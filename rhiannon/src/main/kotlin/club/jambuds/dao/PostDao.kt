package club.jambuds.dao

import club.jambuds.dao.mappers.AggregatedPostRowMapper
import club.jambuds.model.AggregatedPost
import club.jambuds.model.ItemType
import club.jambuds.model.Post
import org.jdbi.v3.sqlobject.config.RegisterRowMapper
import org.jdbi.v3.sqlobject.customizer.Bind
import org.jdbi.v3.sqlobject.locator.UseClasspathSqlLocator
import org.jdbi.v3.sqlobject.statement.GetGeneratedKeys
import org.jdbi.v3.sqlobject.statement.SqlQuery
import org.jdbi.v3.sqlobject.statement.SqlUpdate
import java.time.Instant
import org.jdbi.v3.sqlobject.customizer.Define

interface PostDao {
    @SqlQuery
    @RegisterRowMapper(AggregatedPostRowMapper::class)
    @UseClasspathSqlLocator
    fun getPublicAggregatedPosts(
        @Bind("limit") limit: Int,
        @Bind("beforeTimestamp") beforeTimestamp: Instant?,
        @Bind("afterTimestamp") afterTimestamp: Instant?
    ): List<AggregatedPost>

    @SqlQuery
    @RegisterRowMapper(AggregatedPostRowMapper::class)
    @UseClasspathSqlLocator
    fun getAggregatedPostsByUserFeed(
        currentUserId: Int,
        limit: Int,
        beforeTimestamp: Instant?,
        afterTimestamp: Instant?
    ): List<AggregatedPost>

    @SqlQuery
    @UseClasspathSqlLocator
    fun getPostsForUserPlaylist(
        userId: Int,
        onlyMixtapes: Boolean,
        limit: Int,
        beforeTimestamp: Instant?,
        afterTimestamp: Instant?
    ): List<Post>

    @SqlUpdate(
        """
        insert into posts (user_id, <itemType>_id, note) values (:userId, :itemId, :note)
        """
    )
    @GetGeneratedKeys
    fun createPost(userId: Int, @Define("itemType") itemType: ItemType, itemId: Int, note: String?): Post

    @SqlQuery("select * from posts where user_id = :userId and <itemType>_id = :itemId")
    fun getUserPostForItem(userId: Int, @Define("itemType") itemType: ItemType, itemId: Int): Post?

    @SqlQuery
    @UseClasspathSqlLocator
    fun getPostById(postId: Int): Post?

    @SqlUpdate
    @UseClasspathSqlLocator
    fun deletePostById(postId: Int)

    @SqlQuery("SELECT EXISTS(SELECT * FROM posts WHERE id=:postId)")
    fun getPostExistsById(postId: Int): Boolean
}
