package club.jambuds.web

import club.jambuds.dao.UserDao
import io.javalin.http.Context
import io.javalin.http.UnauthorizedResponse

class AuthHandlers(private val userDao: UserDao) {
    fun setUserFromHeader(ctx: Context) {
        val token = ctx.header("X-Auth-Token")
        if (token != null) {
            val user = userDao.getUserByAuthToken(token)
            if (user == null) {
                throw UnauthorizedResponse("Invalid auth token")
            } else {
                ctx.attribute("currentUser", user)
            }
        }
    }
}
