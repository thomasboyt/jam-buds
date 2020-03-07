package club.jambuds.web

import club.jambuds.AppTest
import club.jambuds.getGson
import club.jambuds.helpers.TestDataFactories
import club.jambuds.responses.CurrentUser
import club.jambuds.responses.GetCurrentUserResponse
import club.jambuds.responses.PublicUser
import club.jambuds.responses.TwitterFriendSuggestionsResponse
import com.nhaarman.mockitokotlin2.times
import com.nhaarman.mockitokotlin2.verify
import com.nhaarman.mockitokotlin2.whenever
import kong.unirest.Unirest
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

class UserRoutesTest : AppTest() {
    private val gson = getGson()

    @Test
    fun `GET me - returns null when logged out`() {
        val resp = Unirest.get("$appUrl/me")
            .asString()
        assertEquals(200, resp.status)

        val body = gson.fromJson(resp.body, GetCurrentUserResponse::class.java)
        assertEquals(null, body.user)
    }

    @Test
    fun `GET me - returns user when logged in`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true, hasTwitter = true)
        val authToken = TestDataFactories.createAuthToken(txn, jeff.id)

        val vinny = TestDataFactories.createUser(txn, "vinny", true, hasTwitter = true)
        TestDataFactories.createUser(txn, "brad", true, hasTwitter = true)
        TestDataFactories.followUser(txn, jeff.id, vinny.id)

        val resp = Unirest.get("$appUrl/me")
            .header("X-Auth-Token", authToken)
            .asString()
        assertEquals(200, resp.status)

        val body = gson.fromJson(resp.body, GetCurrentUserResponse::class.java)
        val expectedUser = CurrentUser(
            id = jeff.id,
            name = "jeff",
            showInPublicFeed = true,
            email = jeff.email,
            twitterName = jeff.twitterName,
            following = listOf(PublicUser(id = vinny.id, name = vinny.name)),
            // TODO: test these
            unreadNotificationCount = 0,
            colorScheme = null
        )
        assertEquals(expectedUser, body.user)
    }

    @Test
    fun `GET friend-suggestions - returns twitter-followed users who are not already jam buds friends`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true, hasTwitter = true)
        val authToken = TestDataFactories.createAuthToken(txn, jeff.id)

        val vinny = TestDataFactories.createUser(txn, "vinny", true, hasTwitter = true)
        val brad = TestDataFactories.createUser(txn, "vinny", true, hasTwitter = true)
        val dan = TestDataFactories.createUser(txn, "vinny", true, hasTwitter = true)
        val alex = TestDataFactories.createUser(txn, "vinny", true, hasTwitter = false)
        val abby = TestDataFactories.createUser(txn, "vinny", true, hasTwitter = false)

        TestDataFactories.followUser(txn, jeff.id, brad.id)
        TestDataFactories.followUser(txn, jeff.id, alex.id)

        val twitterFollowed = listOf(vinny.twitterId!!, brad.twitterId!!)
        whenever(mockTwitterService.getTwitterFriendIds(jeff)).thenReturn(twitterFollowed)

        val resp = Unirest.get("$appUrl/friend-suggestions")
            .header("X-Auth-Token", authToken)
            .asString()
        assertEquals(200, resp.status)
        var body = gson.fromJson(resp.body, TwitterFriendSuggestionsResponse::class.java)
        assertEquals(1, body.users.size)
        assertEquals(vinny.id, body.users[0].id)

        val secondResp = Unirest.get("$appUrl/friend-suggestions")
            .header("X-Auth-Token", authToken)
            .asString()
        assertEquals(200, secondResp.status)
        body = gson.fromJson(resp.body, TwitterFriendSuggestionsResponse::class.java)
        assertEquals(1, body.users.size)
        assertEquals(vinny.id, body.users[0].id)

        // ensure cached friends list was used
        verify(mockTwitterService, times(1)).getTwitterFriendIds(jeff)
    }
}
