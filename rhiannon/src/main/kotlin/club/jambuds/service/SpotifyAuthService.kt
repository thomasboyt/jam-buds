package club.jambuds.service

import club.jambuds.dao.cache.OAuthStateDao
import com.wrapper.spotify.SpotifyApi
import com.wrapper.spotify.SpotifyHttpManager
import com.wrapper.spotify.enums.ProductType
import com.wrapper.spotify.exceptions.SpotifyWebApiException
import com.wrapper.spotify.model_objects.credentials.AuthorizationCodeCredentials
import java.net.URI

class SpotifyAuthService(
    private val appUrl: String,
    private val oAuthStateDao: OAuthStateDao,
    private val clientId: String,
    private val clientSecret: String
) {
    private val mobileRedirectUri = SpotifyHttpManager.makeUri("jambuds://spotify-auth-callback")
    private val webRedirectUri = SpotifyHttpManager.makeUri("$appUrl/auth/spotify-connect/cb")

    private fun createSpotifyApi(isMobile: Boolean): SpotifyApi {
        val redirectUri = if (isMobile) {
            mobileRedirectUri
        } else {
            webRedirectUri
        }
        return SpotifyApi.Builder()
            .setClientId(clientId)
            .setClientSecret(clientSecret)
            .setRedirectUri(redirectUri)
            .build()
    }

    fun getAuthorizeUri(redirectPath: String): URI {
        val stateToken = oAuthStateDao.createStateToken(redirectPath)

        val scopes = listOf(
            "streaming",
            "user-read-birthdate",
            "user-read-email",
            "user-read-private"
        ).joinToString(",")

        val authorizationCodeUriRequest = createSpotifyApi(isMobile = false).authorizationCodeUri()
            .state(stateToken)
            .scope(scopes)
            .build()

        return authorizationCodeUriRequest.execute()
    }

    fun redeemCallbackCode(code: String, isMobile: Boolean): AuthorizationCodeCredentials {
        val authorizationCodeRequest = createSpotifyApi(isMobile).authorizationCode(code).build()
        return authorizationCodeRequest.execute()
    }

    fun validateUserCanPlayback(credentials: AuthorizationCodeCredentials): Boolean {
        val spotifyApi = createSpotifyApi(isMobile = false)
        spotifyApi.accessToken = credentials.accessToken
        val resp = spotifyApi.currentUsersProfile.build().execute()
        return resp.product == ProductType.PREMIUM
    }

    fun getRedirectPathForStateToken(stateToken: String): String {
        return oAuthStateDao.getRedirectPathForStateToken(stateToken)
            ?: throw IllegalStateException("No redirect path found for state $stateToken")
    }

    fun getRefreshedCredentials(
        spotifyRefreshToken: String,
        isMobile: Boolean
    ): AuthorizationCodeCredentials? {
        val spotifyApi = createSpotifyApi(isMobile = isMobile)
        val req = spotifyApi.authorizationCodeRefresh()
            .refresh_token(spotifyRefreshToken)
            .build()

        return try {
            req.execute()
        } catch (err: SpotifyWebApiException) {
            if (err.message != null && err.message == "Refresh token revoked") {
                return null
            }
            throw err
        }
    }
}
