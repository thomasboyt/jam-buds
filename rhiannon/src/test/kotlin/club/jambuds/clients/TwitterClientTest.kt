package club.jambuds.clients

import okhttp3.FormBody
import okhttp3.Request
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

class TwitterClientTest {
    @Test
    fun testGetAuthorizationHeader() {
        val body = FormBody.Builder()
            .addEncoded("status", "Hello Ladies + Gentlemen, a signed OAuth request!")
            .build()

        val request = Request.Builder()
            .url("https://api.twitter.com/1.1/statuses/update.json?include_entities=true")
            .post(body)
            .build()

        val header = getAuthorizationHeader(
            consumerKey = "xvz1evFS4wEEPTGEFPHBog",
            consumerSecret = "kAcSOqF21Fu85e7zjz7ZN2U4ZRhfV3WpwPAoE3Z7kBw",
            accessToken = "370773112-GmHxMAgYyLbNEtIKZeRNFsMKPR9EyMZeS9weJAEb",
            accessSecret = "LswwdoUaIvS8ltyTt5jkRh4J50vUPVVHtR2YPi5kE",
            oauthNonce = "kYjzVBB8Y0ZFabxSWbWovY3uYSQ2pTgmZeNu2VS4cg",
            timestamp = 1318622958,
            request = request,
            customHeaders = null
        )

        assertEquals(
            "OAuth "
                + "oauth_consumer_key=\"xvz1evFS4wEEPTGEFPHBog\", "
                + "oauth_nonce=\"kYjzVBB8Y0ZFabxSWbWovY3uYSQ2pTgmZeNu2VS4cg\", "
                + "oauth_signature=\"hCtSmYh%2BiHYCEqBWrE7C7hYmtUk%3D\", "
                + "oauth_signature_method=\"HMAC-SHA1\", "
                + "oauth_timestamp=\"1318622958\", "
                + "oauth_token=\"370773112-GmHxMAgYyLbNEtIKZeRNFsMKPR9EyMZeS9weJAEb\", "
                + "oauth_version=\"1.0\"",
            header
        )
    }

    @Test
    fun testGetRequestTokenAuthorizationHeader() {
        val body = FormBody.Builder()
            .build()

        val request = Request.Builder()
            .url("https://api.twitter.com/oauth/request_token")
            .post(body)
            .build()

        val header = getAuthorizationHeader(
            consumerKey = "cChZNFj6T5R0TigYB9yd1w",
            consumerSecret = "L8qq9PZyRg6ieKGEKhZolGC0vJWLw8iEJ88DRdyOg",
            accessToken = null,
            accessSecret = null,
            oauthNonce = "ea9ec8429b68d6b77cd5600adbbb0456",
            timestamp = 1318467427,
            request = request,
            customHeaders = mapOf(
                "oauth_callback" to "http://localhost/sign-in-with-twitter/"
            )
        )

        assertEquals(
            "OAuth "
                + "oauth_callback=\"http%3A%2F%2Flocalhost%2Fsign-in-with-twitter%2F\", "
                + "oauth_consumer_key=\"cChZNFj6T5R0TigYB9yd1w\", "
                + "oauth_nonce=\"ea9ec8429b68d6b77cd5600adbbb0456\", "
                + "oauth_signature=\"F1Li3tvehgcraF8DMJ7OyxO4w9Y%3D\", "
                + "oauth_signature_method=\"HMAC-SHA1\", "
                + "oauth_timestamp=\"1318467427\", "
                + "oauth_version=\"1.0\"",
            header
        )
    }
}
