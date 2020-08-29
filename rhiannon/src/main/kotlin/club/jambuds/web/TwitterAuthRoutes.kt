package club.jambuds.web

import club.jambuds.dao.UserDao
import club.jambuds.dao.cache.OAuthStateDao
import club.jambuds.model.User
import club.jambuds.service.ExistingTwitterException
import club.jambuds.service.TwitterAuthService
import club.jambuds.web.extensions.requireUser
import io.javalin.apibuilder.ApiBuilder
import io.javalin.http.BadRequestResponse
import io.javalin.http.Context
import io.javalin.http.UnauthorizedResponse

class TwitterAuthRoutes(
    private val twitterAuthService: TwitterAuthService,
    private val userDao: UserDao,
    private val oAuthStateDao: OAuthStateDao,
    val appUrl: String
) {
    fun register() {
        ApiBuilder.get("/auth/twitter-connect", this::redirectToTwitterAuth)
        ApiBuilder.get("/auth/twitter-connect/cb", this::twitterAuthCallback)
        ApiBuilder.delete("/api/twitter-connect", this::deleteTwitterConnection)
    }

    private fun redirectToTwitterAuth(ctx: Context) {
        requireUserFromCookie(ctx)
        val redirect = ctx.queryParam("redirect") ?: "/"
        val state = oAuthStateDao.createStateToken(redirect)
        val callbackUrl = "$appUrl/auth/twitter-connect/cb?state=$state"
        val token = twitterAuthService.getRequestToken(callbackUrl)
        val url = "https://api.twitter.com/oauth/authenticate?oauth_token=$token"
        ctx.redirect(url)
    }

    private fun twitterAuthCallback(ctx: Context) {
        val user = requireUserFromCookie(ctx)
        val state = ctx.queryParam("state") ?: throw BadRequestResponse("Missing `state` param")
        val redirect = oAuthStateDao.getRedirectPathForStateToken(state)
            ?: throw BadRequestResponse("Invalid `state` param")
        val oauthToken =
            ctx.queryParam("oauth_token") ?: throw BadRequestResponse("Missing `oauth_token` param")
        val oauthVerifier =
            ctx.queryParam("oauth_verifier") ?: throw BadRequestResponse("Missing `oauth_verifier` param")

        try {
            twitterAuthService.getAndSaveCredentials(user, oauthToken, oauthVerifier)
        } catch (err: ExistingTwitterException) {
            ctx.redirect("$redirect?twitterAuthError=alreadyUsed")
            return
        }

        ctx.redirect(redirect)
    }

    private fun requireUserFromCookie(ctx: Context): User {
        val authToken = ctx.cookie(AUTH_TOKEN_COOKIE) ?: throw UnauthorizedResponse("Missing auth token cookie")
        return userDao.getUserByAuthToken(authToken) ?: throw UnauthorizedResponse("Inavlid auth token cookie")
    }

    private fun deleteTwitterConnection(ctx: Context) {
        val user = ctx.requireUser()
        userDao.deleteTwitterCredentials(user.id)
        ctx.status(204)
    }
}
