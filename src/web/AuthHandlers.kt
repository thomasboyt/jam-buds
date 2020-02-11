package web

import io.javalin.http.Context
import io.javalin.http.UnauthorizedResponse

class AuthHandlers(val userDao: dao.UserDao) {
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
