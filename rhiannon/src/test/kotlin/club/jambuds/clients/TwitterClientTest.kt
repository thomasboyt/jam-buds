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
            request = request
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
}
