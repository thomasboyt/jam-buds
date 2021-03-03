package club.jambuds.web

import club.jambuds.AppTest
import club.jambuds.helpers.TestDataFactories
import club.jambuds.responses.GetCurrentUserResponse
import kong.unirest.Unirest
import kong.unirest.json.JSONObject
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

class SettingsRoutesTest : AppTest() {
    @Test
    fun `POST settings_color-scheme - creates or updates color scheme`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true, hasTwitter = true)
        val authToken = TestDataFactories.createAuthToken(txn, jeff.id)

        var resp = Unirest
            .post("$appUrl/settings/color-scheme")
            .header("X-Auth-Token", authToken)
            .body(JSONObject(mapOf("backgroundGradientName" to "rainbow", "textColor" to "black")))
            .asString()
        assertEquals(204, resp.status)

        resp = Unirest.get("$appUrl/me")
            .header("X-Auth-Token", authToken)
            .asString()
        assertEquals(200, resp.status)

        var meBody = objectMapper.readValue(resp.body, GetCurrentUserResponse::class.java)
        assertEquals("rainbow", meBody.user!!.profile.colorScheme.backgroundGradientName)
        assertEquals("black", meBody.user!!.profile.colorScheme.textColor)

        resp = Unirest
            .post("$appUrl/settings/color-scheme")
            .header("X-Auth-Token", authToken)
            .body(
                JSONObject(
                    mapOf(
                        "backgroundGradientName" to "darkRainbow",
                        "textColor" to "white"
                    )
                )
            )
            .asString()
        assertEquals(204, resp.status)

        resp = Unirest.get("$appUrl/me")
            .header("X-Auth-Token", authToken)
            .asString()
        assertEquals(200, resp.status)

        meBody = objectMapper.readValue(resp.body, GetCurrentUserResponse::class.java)
        assertEquals("darkRainbow", meBody.user!!.profile.colorScheme.backgroundGradientName)
        assertEquals("white", meBody.user!!.profile.colorScheme.textColor)
    }
}
