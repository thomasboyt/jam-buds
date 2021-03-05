package club.jambuds.web

import club.jambuds.responses.SendSignInTokenSkipAuthResponse
import club.jambuds.responses.SignInResponse
import club.jambuds.service.AuthService
import club.jambuds.web.extensions.validateJsonBody
import io.javalin.apibuilder.ApiBuilder
import io.javalin.http.Context
import io.javalin.plugin.openapi.annotations.OpenApi
import io.javalin.plugin.openapi.annotations.OpenApiContent
import io.javalin.plugin.openapi.annotations.OpenApiRequestBody
import io.javalin.plugin.openapi.annotations.OpenApiResponse
import javax.servlet.http.Cookie
import javax.validation.constraints.Pattern
import javax.validation.constraints.Size

const val AUTH_TOKEN_COOKIE = "jamBudsAuthToken"
const val EMAIL_RE =
    """^[^\s@]+@[^\s@]+\.[^\s@]+$"""
const val USERNAME_RE =
    """^[a-zA-Z0-9_]+$"""

class AuthRoutes(private val authService: AuthService, private val appUrl: String) {
    fun register() {
        ApiBuilder.post("/api/sign-in-token", this::sendSignInToken)
        ApiBuilder.post("/api/validate-sign-in-code", this::validateSignInCode)
        ApiBuilder.post("/api/registration", this::register)
        ApiBuilder.post("/api/sign-in", this::signIn)
        ApiBuilder.post("/api/sign-out", this::signOut)
    }

    data class SendSignInTokenBody(
        @field:Pattern(
            regexp = EMAIL_RE,
            message = "Invalid email format"
        )
        val email: String,
        val signupReferral: String?,
        val dest: String?,
        val sendCodeInsteadOfLink: Boolean?
    )

    @OpenApi(
        tags = ["Authentication"],
        summary = "Send a sign-in token to a given user",
        requestBody = OpenApiRequestBody([OpenApiContent(SendSignInTokenBody::class)]),
        responses = [OpenApiResponse(
            "200",
            description = "Skip-auth response sent for debugging in dev mode only",
            content = [OpenApiContent(SendSignInTokenSkipAuthResponse::class)]
        ), OpenApiResponse("204")]
    )
    private fun sendSignInToken(ctx: Context) {
        val body = ctx.validateJsonBody(SendSignInTokenBody::class.java)
        val resp = authService.sendSignInToken(
            email = body.email,
            signUpReferral = body.signupReferral,
            dest = body.dest,
            sendCodeInsteadOfLink = body.sendCodeInsteadOfLink == true
        )
        if (resp != null) {
            ctx.json(resp)
        } else {
            ctx.status(204)
        }
    }

    data class ValidateSignInCodeBody(
        @field:Pattern(
            regexp = EMAIL_RE,
            message = "Invalid email format"
        )
        val email: String,
        val code: String,
        val signupReferral: String?
    )

    @OpenApi(
        tags = ["Authentication"],
        summary = "Validate a sign in code, returning a sign-in token if valid",
        requestBody = OpenApiRequestBody([OpenApiContent(ValidateSignInCodeBody::class)]),
        responses = [OpenApiResponse("200", [OpenApiContent(ValidateSignInCodeBody::class)])]
    )
    private fun validateSignInCode(ctx: Context) {
        val body = ctx.validateJsonBody(ValidateSignInCodeBody::class.java)
        val resp = authService.validateSignInCode(
            body.email,
            body.code,
            body.signupReferral
        )
        ctx.json(resp)
    }

    data class SignInBody(
        val signInToken: String
    )

    @OpenApi(
        tags = ["Authentication"],
        summary = "Sign in with a given sign-in token, returning an auth token if valid",
        requestBody = OpenApiRequestBody([OpenApiContent(SignInBody::class)]),
        responses = [OpenApiResponse("200", [OpenApiContent(SignInResponse::class)])]
    )
    private fun signIn(ctx: Context) {
        val body = ctx.validateJsonBody(SignInBody::class.java)
        val authToken = authService.signIn(body.signInToken)
        // web uses cookie for ssr...
        setTokenCookie(ctx, authToken)
        // ...mobile (and ssr-less web if needed) uses returned json
        ctx.json(SignInResponse(authToken))
    }

    data class RegisterBody(
        val token: String,
        @field:Pattern(
            regexp = USERNAME_RE,
            message = "Username has invalid characters. Stick to A-z, 0-9, and underscores, please!"
        )
        @field:Size(min = 3, max = 16, message = "Username must be between 3 and 16 characters.")
        val name: String,
        val subscribeToNewsletter: Boolean,
        val showInPublicFeed: Boolean,
        val referral: String?
    )

    @OpenApi(
        tags = ["Registration"],
        summary = "Register a new user account",
        requestBody = OpenApiRequestBody([OpenApiContent(RegisterBody::class)]),
        responses = [OpenApiResponse("204")]
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

        setTokenCookie(ctx, authToken)
        ctx.status(204)
    }

    @OpenApi(
        tags = ["Authentication"],
        summary = "Sign out of a user account, clearing cookies and auth tokens",
        responses = [OpenApiResponse("204")]
    )
    private fun signOut(ctx: Context) {
        val token = ctx.cookie(AUTH_TOKEN_COOKIE)
        if (token != null) {
            authService.deleteAuthToken(token)
            ctx.removeCookie(AUTH_TOKEN_COOKIE, "/")
        }
        ctx.status(204)
    }

    private fun setTokenCookie(ctx: Context, authToken: String) {
        ctx.cookie(
            Cookie(AUTH_TOKEN_COOKIE, authToken).apply {
                maxAge = 60 * 60 * 24 * 365
                isHttpOnly = true
                secure = appUrl.startsWith("https")
            }
        )
    }
}
