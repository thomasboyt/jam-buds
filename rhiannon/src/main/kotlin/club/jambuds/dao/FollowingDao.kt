package club.jambuds.dao

import org.jdbi.v3.sqlobject.statement.SqlUpdate

interface FollowingDao {
    @SqlUpdate(
        """
        INSERT INTO following (user_id, following_id)
        VALUES                (:userId, :userToFollowId)
        """
    )
    fun followUser(userId: Int, userToFollowId: Int)

    @SqlUpdate(
        """
        DELETE FROM following WHERE user_id = :userId AND following_id = :followingId
        """
    )
    fun unfollowUser(userId: Int, followingId: Int)
}
