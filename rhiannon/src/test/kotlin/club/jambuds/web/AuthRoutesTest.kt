package club.jambuds.web

import club.jambuds.AppTest
import club.jambuds.getGson
import club.jambuds.helpers.TestDataFactories
import club.jambuds.responses.GetCurrentUserResponse
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
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

class AuthRoutesTest : AppTest() {
    private val gson = getGson()

    private fun getSignInToken(email: String): String {
        val query = "select token from sign_in_tokens where email=:email"
        return txn.createQuery(query).bind("email", email).mapTo(String::class.java).one()
    }

    private fun getAuthToken(userId: Int): String {
        val query = "select auth_token from auth_tokens where user_id=:userId"
        return txn.createQuery(query).bind("userId", userId).mapTo(String::class.java).one()
    }

    private fun createSignInToken(email: String): String {
        var resp = Unirest
            .post("$appUrl/sign-in-token")
            .body(JSONObject(mapOf("email" to email)))
            .asString()
        assertEquals(204, resp.status)
        return getSignInToken(email)
    }

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

    @Test
    fun `POST sign-in-token - sends sign up email to new user`() {
        val email = "jeff@jambuds.club"
        val resp = Unirest.post("$appUrl/sign-in-token")
            .body(JSONObject(mapOf("email" to email)))
            .asString()
        assertEquals(204, resp.status)

        val token = getSignInToken(email)
        val appUrl = config.getString("appUrl")
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

        val token = getSignInToken(email)
        val appUrl = config.getString("appUrl")
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
        val user = TestDataFactories.createUser(txn, "jeff", true)
        val email = user.email
        val resp = Unirest.post("$appUrl/sign-in-token")
            .body(JSONObject(mapOf("email" to email)))
            .asString()
        assertEquals(204, resp.status)

        val token = getSignInToken(email)
        val appUrl = config.getString("appUrl")
        val url = "$appUrl/auth/sign-in?t=$token"

        verify(mockEmailClient, times(1)).sendEmail(
            fromEmail = any(),
            fromName = any(),
            toEmail = eq(email),
            subject = argForWhich { contains("sign-in") },
            textContent = check {
                assertTrue(it.contains("Welcome back"))
                assertTrue(it.contains(url))
            },
            htmlContent = check {
                assertTrue(it.contains("Welcome back"))
                assertTrue(it.contains(url))
            }
        )
    }

    @Test
    fun `GET auth_sign-in - signs in as user`() {
        val user = TestDataFactories.createUser(txn, "jeff", true)
        val signInToken = createSignInToken(user.email)

        val resp = Unirest.get("$authUrl/sign-in?t=$signInToken").asString()
        assertEquals(302, resp.status)

        val authToken = getAuthToken(user.id)
        assertEquals(authToken, resp.cookies.getNamed(AUTH_TOKEN_COOKIE).value)
    }

    @Test
    fun `POST registration - creates a new user`() {
        TestDataFactories.createUser(txn, "vinny", true)
        val signInToken = createSignInToken("jeff@jambuds.club")

        val body = JSONObject(
            mapOf(
                "token" to signInToken,
                "name" to "jeff",
                "subscribeToNewsletter" to false,
                "showInPublicFeed" to true,
                "referral" to "vinny"
            )
        )

        val resp = Unirest.post("$appUrl/registration")
            .body(body)
            .asString()
        assertEquals(204, resp.status)

        val user = userDao.getUserByEmail("jeff@jambuds.club")
        assertNotNull(user, "User should not be null")

        val authToken = getAuthToken(user.id)
        assertEquals(authToken, resp.cookies.getNamed(AUTH_TOKEN_COOKIE).value)

        assertTrue(user.showInPublicFeed, "User should be shown in public feed")

        verify(mockButtondownService, times(1)).subscribe("jeff@jambuds.club")

        val meResp = Unirest.get("$appUrl/me")
            .header("X-Auth-Token", authToken)
            .asString()
        assertEquals(200, meResp.status)
        val me = gson.fromJson(meResp.body, GetCurrentUserResponse::class.java)
        assertEquals(
            "vinny",
            me.user!!.following[0].name,
            "User should follow registration referrer"
        )
    }

    @Test
    fun `POST registration - validates username`() {
        val signInToken = createSignInToken("jeff@jambuds.club")

        fun registerWithInvalidUsername(username: String) {
            val resp = Unirest.post("$appUrl/registration")
                .body(mapOf("token" to signInToken, "name" to username))
                .asString()
            assertEquals(400, resp.status, "Username $username should be rejected")
        }

        registerWithInvalidUsername("a")
        registerWithInvalidUsername("abcdefghijklmnopqrstuvwxyz")
        registerWithInvalidUsername("a b c d")
        registerWithInvalidUsername("a/bcd")
    }
}
