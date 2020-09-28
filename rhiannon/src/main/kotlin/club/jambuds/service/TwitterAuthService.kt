package club.jambuds.service

import club.jambuds.clients.createTwitterClient
import club.jambuds.clients.createTwitterOauthClient
import club.jambuds.dao.UserDao
import club.jambuds.model.User
import io.javalin.http.InternalServerErrorResponse

class ExistingTwitterException : Exception()

class TwitterAuthService(
    private val userDao: UserDao,
    private val consumerKey: String,
    private val consumerSecret: String
) {
    fun getRequestToken(callbackUrl: String): String {
        val twitterOauthClient = createTwitterOauthClient(
            consumerKey,
            consumerSecret,
            mapOf(
                "oauth_callback" to callbackUrl
            )
        )

        val resp = twitterOauthClient.createRequestToken().execute()

        if (!resp.isSuccessful) {
            val err = resp.errorBody()?.string()
            throw InternalServerErrorResponse(
                "Failed to fetch request token: status ${resp.code()} \n $err"
            )
        }

        val resultParams = parseAuthResponseBody(resp.body()!!)

        if (resultParams["oauth_callback_confirmed"] != "true") {
            throw InternalServerErrorResponse("Twitter auth: oauth_callback_confirmed not true")
        }

        return resultParams["oauth_token"] ?: error("Twitter auth: Missing oauth_token")
    }

    data class TwitterOauthCredentials(val accessToken: String, val accessSecret: String)

    private fun getAccessToken(oauthToken: String, oauthVerifier: String): TwitterOauthCredentials {
        val twitterOauthClient = createTwitterOauthClient(
            consumerKey,
            consumerSecret,
            mapOf(
                "oauth_token" to oauthToken
            )
        )

        val resp = twitterOauthClient.createAccessToken(oauthVerifier).execute()

        if (!resp.isSuccessful) {
            val err = resp.errorBody()?.string()
            throw InternalServerErrorResponse(
                "Failed to fetch request token: status ${resp.code()} \n $err"
            )
        }

        val resultParams = parseAuthResponseBody(resp.body()!!)

        return TwitterOauthCredentials(
            resultParams["oauth_token"] ?: error("missing `oauth-token`"),
            resultParams["oauth_token_secret"] ?: error("missing `oauth_token_secret")
        )
    }

    private fun parseAuthResponseBody(body: String): Map<String, String> {
        return body
            .split("&")
            .map { it.split("=") }
            .map { it[0] to it[1] }
            .toMap()
    }

    fun getAndSaveCredentials(user: User, oauthToken: String, oauthVerifier: String) {
        val credentials = getAccessToken(oauthToken, oauthVerifier)

        val client = createTwitterClient(
            consumerKey,
            consumerSecret,
            credentials.accessToken,
            credentials.accessSecret
        )
        val resp = client.verifyCredentials().execute()

        if (!resp.isSuccessful) {
            val err = resp.errorBody()?.string()
            throw InternalServerErrorResponse(
                "Failed to verify Twitter credentials: status ${resp.code()} \n $err"
            )
        }

        val twitterUser = resp.body()!!
        val twitterId = twitterUser.id_str
        val twitterName = twitterUser.screen_name

        val existingUser = userDao.getUserByTwitterId(twitterId)
        if (existingUser != null) {
            throw ExistingTwitterException()
        }

        userDao.updateTwitterCredentials(
            userId = user.id,
            twitterId = twitterId,
            twitterName = twitterName,
            twitterToken = credentials.accessToken,
            twitterSecret = credentials.accessSecret
        )
    }
}
