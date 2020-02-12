package club.jambuds.dao

import club.jambuds.model.User
import org.jdbi.v3.sqlobject.locator.UseClasspathSqlLocator
import org.jdbi.v3.sqlobject.statement.SqlQuery

@UseClasspathSqlLocator
interface UserDao {
    @SqlQuery
    fun getUserByAuthToken(authToken: String): User?

    @SqlQuery
    fun getUserByUserName(userName: String): User?
}
