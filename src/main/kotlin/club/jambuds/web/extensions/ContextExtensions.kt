package club.jambuds.web.extensions

import club.jambuds.model.User
import io.javalin.http.Context
import io.javalin.http.UnauthorizedResponse

val Context.currentUser: User?
    get() = this.attribute("currentUser") as? User

fun Context.requireUser(): User {
    val user = this.attribute("currentUser") as? User
    if (user == null) {
        throw UnauthorizedResponse("Not logged in")
    }
    return user
}
