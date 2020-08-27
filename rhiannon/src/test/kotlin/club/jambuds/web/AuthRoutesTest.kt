package club.jambuds.web

import club.jambuds.AppTest
import club.jambuds.getGson
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.argForWhich
import com.nhaarman.mockitokotlin2.check
import com.nhaarman.mockitokotlin2.eq
import com.nhaarman.mockitokotlin2.times
import com.nhaarman.mockitokotlin2.verify
import kong.unirest.Unirest
import kong.unirest.json.JSONObject
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class AuthRoutesTest : AppTest() {
    private val gson = getGson()

    @Test
    fun `POST sign-in-token - validates email address`() {
        var resp = Unirest.post("$appUrl/sign-in-token")
            .body(JSONObject(mapOf("email" to "jeff")))
            .asString()
        assertEquals(400, resp.status)

        resp = Unirest.post("$appUrl/sign-in-token")
            .body(JSONObject(mapOf("email" to "jeff@")))
            .asString()
        assertEquals(400, resp.status)

        resp = Unirest.post("$appUrl/sign-in-token")
            .body(JSONObject(mapOf("email" to "jambuds.club")))
            .asString()
        assertEquals(400, resp.status)

        resp = Unirest.post("$appUrl/sign-in-token")
            .body(JSONObject(mapOf("email" to "jeff@jambuds.club")))
            .asString()
        assertEquals(204, resp.status)
    }

    private fun getSignInToken(email: String): String {
        val query = "select token from sign_in_tokens where email=:email"
        return txn.createQuery(query).bind("email", email).mapTo(String::class.java).one()
    }

    @Test
    fun `POST sign-in-token - sends sign up email to new user`() {
        val email = "jeff@jambuds.club"
        val resp = Unirest.post("$appUrl/sign-in-token")
            .body(JSONObject(mapOf("email" to email)))
            .asString()
        assertEquals(204, resp.status)

        // get the last created sign up token to figure out
        val appUrl = config.getString("appUrl")
        val token = getSignInToken(email)
        val url = "$appUrl/welcome/registration?t=$token"

        verify(mockEmailClient, times(1)).sendEmail(
            fromEmail = any(),
            fromName = any(),
            toEmail = eq(email),
            subject = argForWhich { contains("Welcome") },
            textContent = check {
                assertTrue(it.contains("Welcome"))
                assertTrue(it.contains(url))
            },
            htmlContent = check {
                assertTrue(it.contains("Welcome"))
                assertTrue(it.contains(url))
            }
        )
    }

    @Test
    fun `POST sign-in-token - sends sign up email with referral user if present`() {
        val email = "jeff@jambuds.club"
        val resp = Unirest.post("$appUrl/sign-in-token")
            .body(JSONObject(mapOf("email" to email, "signupReferral" to "vinny")))
            .asString()
        assertEquals(204, resp.status)

        // get the last created sign up token to figure out
        val appUrl = config.getString("appUrl")
        val token = getSignInToken(email)
        val url = "$appUrl/welcome/registration?t=$token&referral=vinny"

        verify(mockEmailClient, times(1)).sendEmail(
            fromEmail = any(),
            fromName = any(),
            toEmail = eq(email),
            subject = argForWhich { contains("Welcome") },
            textContent = check {
                assertTrue(it.contains("Welcome"))
                assertTrue(it.contains(url))
            },
            htmlContent = check {
                assertTrue(it.contains("Welcome"))
                assertTrue(it.contains(url))
            }
        )
    }

    @Test
    fun `POST sign-in-token - sends sign in email to existing user`() {
    }

    @Test
    fun `POST sign-in-token - creates sign up token`() {
    }

    @Test
    fun `GET auth_sign-in - signs in as user`() {
    }
}
