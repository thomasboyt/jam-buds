package club.jambuds.web.extensions

import club.jambuds.model.User
import club.jambuds.service.DevSlackWebhookService
import club.jambuds.util.FormValidationErrorResponse
import io.javalin.Javalin
import io.javalin.http.BadRequestResponse
import io.javalin.http.Context
import io.javalin.http.UnauthorizedResponse
import javax.validation.Validation
import org.slf4j.Logger
import org.slf4j.LoggerFactory

val Context.logger: Logger
    get() = LoggerFactory.getLogger(Context::class.java.name)

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
        bodyAsClass(clazz)
    } catch (e: Exception) {
        logger.info("Couldn't deserialize body to ${clazz.simpleName}", e)
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
