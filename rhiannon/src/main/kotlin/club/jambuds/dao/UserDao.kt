package club.jambuds.dao

import club.jambuds.model.User
import org.jdbi.v3.sqlobject.customizer.BindList
import org.jdbi.v3.sqlobject.locator.UseClasspathSqlLocator
import org.jdbi.v3.sqlobject.statement.GetGeneratedKeys
import org.jdbi.v3.sqlobject.statement.SqlQuery
import org.jdbi.v3.sqlobject.statement.SqlUpdate

@UseClasspathSqlLocator
interface UserDao {
    @SqlQuery
    fun getUserByAuthToken(authToken: String): User?

    @SqlQuery
    fun getUserByUserName(userName: String): User?

    @SqlQuery
    fun getUserByUserId(userId: Int): User?

    @SqlQuery
    fun getUserByEmail(email: String): User?

    @SqlQuery
    fun getUserByTwitterId(twitterId: String): User?

    @SqlQuery
    fun getUnfollowedUsersByTwitterIds(
        userId: Int,
        @BindList("twitterIds") twitterIds: List<String>
    ): List<User>

    @SqlQuery
    fun getFollowingForUserId(userId: Int): List<User>

    @SqlQuery
    fun getFollowersForUserId(userId: Int): List<User>

    @SqlQuery
    fun getUsersByIds(@BindList("userIds") userIds: List<Int>): List<User>

    @SqlQuery
    fun getUsersByNames(@BindList("userNames") userNames: List<String>): List<User>

    @SqlUpdate
    @GetGeneratedKeys
    fun createUser(email: String, name: String, showInPublicFeed: Boolean): User

    @SqlUpdate
    fun updatePublicFeedVisibility(userId: Int, showInPublicFeed: Boolean)

    @SqlUpdate
    fun updateTwitterCredentials(
        userId: Int,
        twitterId: String,
        twitterName: String,
        twitterToken: String,
        twitterSecret: String
    )

    @SqlUpdate
    fun deleteTwitterCredentials(userId: Int)
}
