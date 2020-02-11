package dao

import org.jdbi.v3.sqlobject.statement.SqlQuery
import org.jdbi.v3.sqlobject.locator.UseClasspathSqlLocator

import model.User

@UseClasspathSqlLocator
interface UserDao {
    @SqlQuery
    fun getUserByAuthToken(authToken: String): User?
}