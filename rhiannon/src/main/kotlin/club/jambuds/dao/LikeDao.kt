package club.jambuds.dao

import club.jambuds.model.Like
import club.jambuds.model.ItemType
import org.jdbi.v3.sqlobject.locator.UseClasspathSqlLocator
import org.jdbi.v3.sqlobject.statement.SqlQuery
import org.jdbi.v3.sqlobject.statement.SqlUpdate
import java.time.Instant
import org.jdbi.v3.sqlobject.customizer.Define

interface LikeDao {
    @UseClasspathSqlLocator
    @SqlQuery
    fun getLikesForUser(
        userId: Int,
        limit: Int,
        beforeTimestamp: Instant?,
        afterTimestamp: Instant?
    ): List<Like>

    @SqlQuery(
        """
        SELECT EXISTS(
            SELECT * FROM likes WHERE <itemType>_id = :itemId AND user_id = :userId
        )
        """
    )
    fun getLikeExists(userId: Int, @Define("itemType") itemType: ItemType, itemId: Int): Boolean

    @SqlUpdate(
        """
        INSERT INTO likes (user_id, <itemType>_id)
                   VALUES (:userId, :itemId)
        """
    )
    fun createLike(userId: Int, @Define("itemType") itemType: ItemType, itemId: Int)

    @SqlUpdate(
        """
        DELETE FROM likes WHERE user_id = :userId and <itemType>_id = :itemId
        """
    )
    fun deleteLike(userId: Int, @Define("itemType") itemType: ItemType, itemId: Int)
}
