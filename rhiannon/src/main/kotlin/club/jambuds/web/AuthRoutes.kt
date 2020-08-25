package club.jambuds.web

import club.jambuds.service.AuthService
import club.jambuds.web.extensions.currentUser
import club.jambuds.web.extensions.validateJsonBody
import com.google.gson.annotations.Expose
import io.javalin.apibuilder.ApiBuilder
import io.javalin.http.Context
import javax.validation.constraints.NotNull
import javax.validation.constraints.Pattern
import javax.validation.constraints.Size

const val AUTH_TOKEN_COOKIE = "jamBudsAuthToken"

class AuthRoutes(private val authService: AuthService, private val appUrl: String) {
    fun register() {
        ApiBuilder.post("/api/sign-in-token", this::sendSignInToken)
        ApiBuilder.post("/api/registration", this::register)
        ApiBuilder.get("/auth/sign-in", this::signIn)
        ApiBuilder.post("/api/sign-out", this::signOut)
    }

    data class SendSignInTokenBody(
        @field:NotNull
        @field:Pattern(regexp = """^[^\s@]+@[^\s@]+\.[^\s@]+$""", message = "Invalid email format")
        @Expose val email: String,
        @Expose val signupReferral: String?
    )

    private fun sendSignInToken(ctx: Context) {
        val body = ctx.validateJsonBody(SendSignInTokenBody::class.java)
        val resp = authService.sendSignInToken(body.email, body.signupReferral)
        if (resp != null) {
            ctx.json(resp)
        } else {
            ctx.status(204)
        }
    }

    private fun signIn(ctx: Context) {
        if (ctx.currentUser != null) {
            // user is already signed in
            ctx.redirect(appUrl)
            return
        }

        val signInToken = ctx.queryParam<String>("t").get()
        val authToken = authService.signIn(signInToken)
        ctx.cookie(AUTH_TOKEN_COOKIE, authToken, maxAge = 60 * 60 * 24 * 365)
        ctx.redirect(appUrl)
    }

    data class RegisterBody(
        @field:NotNull
        @Expose val token: String,

        @field:NotNull
        @field:Pattern(
            regexp = """^[a-zA-Z0-9_]+$""",
            message = "Username has invalid characters. Stick to A-z, 0-9, and underscores, please!"
        )
        @field:Size(min = 3, max = 16, message = "Username must be between 3 and 16 characters.")
        @Expose val name: String,

        @field:NotNull
        @Expose val subscribeToNewsletter: Boolean,

        @field:NotNull
        @Expose val showInPublicFeed: Boolean,

        @Expose val referral: String
    )

    private fun register(ctx: Context) {
        val body = ctx.validateJsonBody(RegisterBody::class.java)
        val authToken = authService.registerUser(
            token = body.token,
            username = body.name,
            subscribeToNewsletter = body.subscribeToNewsletter,
            showInPublicFeed = body.showInPublicFeed,
            referral = body.referral
        )

        ctx.cookie(AUTH_TOKEN_COOKIE, authToken, maxAge = 60 * 60 * 24 * 365)
        ctx.status(204)
    }

    private fun signOut(ctx: Context) {
        val token = ctx.cookie(AUTH_TOKEN_COOKIE)
        if (token != null) {
            authService.deleteAuthToken(token)
            ctx.removeCookie(AUTH_TOKEN_COOKIE, "/")
        }
        ctx.status(204)
    }
}
