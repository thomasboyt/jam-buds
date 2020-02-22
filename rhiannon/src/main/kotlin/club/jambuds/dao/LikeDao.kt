package club.jambuds.dao

import club.jambuds.model.Like
import org.jdbi.v3.sqlobject.locator.UseClasspathSqlLocator
import org.jdbi.v3.sqlobject.statement.SqlQuery
import org.jdbi.v3.sqlobject.statement.SqlUpdate
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

    @SqlQuery
    fun getSongLikeExists(userId: Int, songId: Int): Boolean

    @SqlUpdate
    fun createSongLike(userId: Int, songId: Int)

    @SqlUpdate
    fun deleteSongLike(userId: Int, songId: Int)
}
