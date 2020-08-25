package club.jambuds.web.extensions

import club.jambuds.model.User
import club.jambuds.util.FormValidationErrorResponse
import io.javalin.Javalin
import io.javalin.http.BadRequestResponse
import io.javalin.http.Context
import io.javalin.http.UnauthorizedResponse
import io.javalin.plugin.json.JavalinJson
import javax.validation.Validation

val Context.currentUser: User?
    get() = this.attribute("currentUser") as? User

fun Context.requireUser(): User {
    val user = this.attribute("currentUser") as? User
    if (user == null) {
        throw UnauthorizedResponse("Not logged in")
    }
    return user
}

fun <T> Context.validateJsonBody(clazz: Class<T>): T {
    // TODO: make json validation error more useful
    val jsonBody = try {
        JavalinJson.fromJson(body(), clazz)
    } catch (e: Exception) {
        Javalin.log?.info("Couldn't deserialize body to ${clazz.simpleName}", e)
        throw BadRequestResponse("Couldn't deserialize body to ${clazz.simpleName}")
    }

    if (jsonBody == null) {
        throw BadRequestResponse("Missing required JSON body")
    }

    // TODO: this factory should be stored + reused
    val factory = Validation.buildDefaultValidatorFactory()

    val validator = factory.validator
    val violations = validator.validate(jsonBody)
    if (violations.size > 0) {
        val errors = violations.map { it.propertyPath.joinToString(".") to it.message }
        throw FormValidationErrorResponse(errors)
    }

    return jsonBody
}
