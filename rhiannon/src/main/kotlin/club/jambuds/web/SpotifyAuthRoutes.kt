package club.jambuds.web

import club.jambuds.responses.SpotifyTokenResponse
import club.jambuds.service.SpotifyAuthService
import com.wrapper.spotify.model_objects.credentials.AuthorizationCodeCredentials
import io.javalin.apibuilder.ApiBuilder
import io.javalin.http.Context
import org.eclipse.jetty.http.HttpCookie.SAME_SITE_STRICT_COMMENT
import java.time.Instant
import javax.servlet.http.Cookie

class SpotifyAuthRoutes(private val spotifyAuthService: SpotifyAuthService) {
    fun register() {
        ApiBuilder.get("/auth/spotify-connect", this::redirectToSpotifyAuth)
        ApiBuilder.get("/auth/spotify-connect/cb", this::spotifyAuthCallback)
        ApiBuilder.get("/api/spotify-token", this::getSpotifyToken)
        ApiBuilder.delete("/api/spotify-token", this::deleteSpotifyToken)
    }

    private fun redirectToSpotifyAuth(ctx: Context) {
        val redirectPath = ctx.queryParam<String>("redirect").get()
        val uri = spotifyAuthService.getAuthorizeUri(redirectPath)
        ctx.redirect(uri.toString())
    }

    private fun spotifyAuthCallback(ctx: Context) {
        val state = ctx.queryParam<String>("state").get()
        val code = ctx.queryParam<String>("code").getOrNull()
        val error = ctx.queryParam<String>("error").getOrNull()

        fun redirectWithParams(params: String) {
            val redirectPath = spotifyAuthService.getRedirectPathForStateToken(state)
            ctx.redirect("$redirectPath?$params")
        }

        if (error != null) {
            redirectWithParams("spotifyAuthError=$error")
        }

        if (code == null) {
            throw IllegalStateException("Missing one of code or error in spotify callback")
        }

        val credentials = spotifyAuthService.redeemCallbackCode(code)
        val canPlayback = spotifyAuthService.validateUserCanPlayback(credentials)

        if (!canPlayback) {
            redirectWithParams("spotifyAuthError=nonPremium")
        }

        setSpotifyCookies(ctx, credentials)
        redirectWithParams("")
    }

    private fun getSpotifyToken(ctx: Context) {
        val spotifyAccessToken = ctx.cookie("spotifyAccessToken")
        val spotifyRefreshToken = ctx.cookie("spotifyRefreshToken")
        val spotifyExpiresAtMs = ctx.cookie("spotifyExpiresAtMs")?.toLong()

        if (spotifyAccessToken == null || spotifyRefreshToken == null || spotifyExpiresAtMs == null) {
            clearSpotifyCookies(ctx)
            ctx.json(
                SpotifyTokenResponse(
                    spotifyConnected = false,
                    accessToken = null,
                    expiresAtMs = null
                )
            )
            return
        }

        if (spotifyExpiresAtMs > Instant.now().toEpochMilli()) {
            val resp = SpotifyTokenResponse(
                spotifyConnected = true,
                accessToken = spotifyAccessToken,
                expiresAtMs = spotifyExpiresAtMs
            )
            ctx.json(resp)
            return
        }

        val credentials = spotifyAuthService.getRefreshedCredentials(spotifyRefreshToken)

        if (credentials == null) {
            val resp = SpotifyTokenResponse(
                spotifyConnected = false,
                accessToken = null,
                expiresAtMs = null
            )
            ctx.json(resp)
            return
        }

        val expiresAt = setSpotifyCookies(ctx, credentials)
        val resp = SpotifyTokenResponse(
            spotifyConnected = true,
            accessToken = credentials.accessToken,
            expiresAtMs = expiresAt
        )
        ctx.json(resp)
    }

    private fun deleteSpotifyToken(ctx: Context) {
        clearSpotifyCookies(ctx)
        ctx.status(204)
    }

    private fun setSpotifyCookies(ctx: Context, credentials: AuthorizationCodeCredentials): Long {
        val refreshToken = if (credentials.refreshToken == null) {
            ctx.cookie("spotifyRefreshToken")!!
        } else {
            credentials.refreshToken
        }

        val expiresAt =
            Instant.now().plusSeconds(credentials.expiresIn.toLong()).toEpochMilli()

        val accessTokenCookie = Cookie("spotifyAccessToken", credentials.accessToken)
        val refreshTokenCookie = Cookie("spotifyRefreshToken", refreshToken)
        val expiresAtCookie = Cookie("spotifyExpiresAtMs", expiresAt.toString())

        val cookies = listOf(accessTokenCookie, refreshTokenCookie, expiresAtCookie)
        for (cookie in cookies) {
            cookie.isHttpOnly = true
            cookie.maxAge = 60 * 60 * 24 * 365
            cookie.comment = SAME_SITE_STRICT_COMMENT
            ctx.cookie(cookie)
        }

        return expiresAt
    }

    private fun clearSpotifyCookies(ctx: Context) {
        val accessTokenCookie = Cookie("spotifyAccessToken", "")
        val refreshTokenCookie = Cookie("spotifyRefreshToken", "")
        val expiresAtCookie = Cookie("spotifyExpiresAtMs", "")

        val cookies = listOf(accessTokenCookie, refreshTokenCookie, expiresAtCookie)
        for (cookie in cookies) {
            cookie.isHttpOnly = true
            cookie.maxAge = 0
            cookie.comment = SAME_SITE_STRICT_COMMENT
            ctx.cookie(cookie)
        }
    }
}
