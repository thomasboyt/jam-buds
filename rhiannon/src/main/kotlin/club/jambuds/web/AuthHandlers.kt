package club.jambuds.web

import club.jambuds.dao.UserDao
import io.javalin.apibuilder.ApiBuilder.before
import io.javalin.http.Context
import io.javalin.http.UnauthorizedResponse

class AuthHandlers(private val userDao: UserDao) {
    fun register() {
        before(this::setUserFromHeader)
    }

    private fun setUserFromHeader(ctx: Context) {
        val token = ctx.header("X-Auth-Token")
        if (token != null) {
            val user = userDao.getUserByAuthToken(token)
            ctx.attribute("currentUser", user)
        }
    }
}
