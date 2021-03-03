package club.jambuds.web

import club.jambuds.AppTest
import club.jambuds.clients.TwitterUserObject
import club.jambuds.helpers.TestDataFactories
import club.jambuds.responses.CurrentUser
import club.jambuds.responses.GetCurrentUserResponse
import club.jambuds.responses.PublicUser
import club.jambuds.responses.TwitterFriendSuggestionsResponse
import club.jambuds.responses.UserFollowingResponse
import club.jambuds.responses.UserProfile
import club.jambuds.util.defaultColorScheme
import com.nhaarman.mockitokotlin2.times
import com.nhaarman.mockitokotlin2.verify
import com.nhaarman.mockitokotlin2.whenever
import kong.unirest.Unirest
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class UserRoutesTest : AppTest() {
    @Test
    fun `GET me - returns null when logged out`() {
        val resp = Unirest.get("$appUrl/me")
            .asString()
        assertEquals(200, resp.status)

        val body = objectMapper.readValue(resp.body, GetCurrentUserResponse::class.java)
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

        val body = objectMapper.readValue(resp.body, GetCurrentUserResponse::class.java)
        val expectedUser = CurrentUser(
            id = jeff.id,
            name = "jeff",
            showInPublicFeed = true,
            email = jeff.email,
            twitterName = jeff.twitterName,
            following = listOf(PublicUser(id = vinny.id, name = vinny.name)),
            // TODO: test these
            unreadNotificationCount = 0,
            profile = UserProfile(
                id = jeff.id,
                name = "jeff",
                colorScheme = defaultColorScheme
            )
        )
        assertEquals(expectedUser, body.user)
    }

    @Test
    fun `GET friend-suggestions - returns twitter-followed users who are not already jam buds friends`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true, hasTwitter = true)
        val authToken = TestDataFactories.createAuthToken(txn, jeff.id)

        val vinny = TestDataFactories.createUser(txn, "vinny", true, hasTwitter = true)
        val brad = TestDataFactories.createUser(txn, "brad", true, hasTwitter = true)
        TestDataFactories.createUser(txn, "dan", true, hasTwitter = true)
        val alex = TestDataFactories.createUser(txn, "alex", true, hasTwitter = false)
        TestDataFactories.createUser(txn, "abby", true, hasTwitter = false)

        TestDataFactories.followUser(txn, jeff.id, brad.id)
        TestDataFactories.followUser(txn, jeff.id, alex.id)

        val twitterFollowed = listOf(vinny.twitterId!!, brad.twitterId!!)
        whenever(mockTwitterService.getTwitterFriendIds(jeff)).thenReturn(twitterFollowed)
        whenever(mockTwitterService.getTwitterProfiles(jeff, listOf(vinny.twitterId!!))).thenReturn(
            mapOf(
                vinny.twitterId!! to TwitterUserObject(
                    id_str = vinny.twitterId!!,
                    screen_name = "VinnyCaravella",
                    profile_image_url_https = "abc"
                )
            )
        )

        val resp = Unirest.get("$appUrl/friend-suggestions")
            .header("X-Auth-Token", authToken)
            .asString()
        assertEquals(200, resp.status)
        var body = objectMapper.readValue(resp.body, TwitterFriendSuggestionsResponse::class.java)
        assertEquals(1, body.users.size)
        assertEquals(vinny.id, body.users[0].profile.id)
        assertEquals("VinnyCaravella", body.users[0].twitterName)
        assertEquals("abc", body.users[0].twitterAvatar)

        // ensure cached friends list is used
        val secondResp = Unirest.get("$appUrl/friend-suggestions")
            .header("X-Auth-Token", authToken)
            .asString()
        assertEquals(200, secondResp.status)
        body = objectMapper.readValue(resp.body, TwitterFriendSuggestionsResponse::class.java)
        assertEquals(1, body.users.size)
        assertEquals(vinny.id, body.users[0].profile.id)
        verify(mockTwitterService, times(1)).getTwitterFriendIds(jeff)
    }

    @Test
    fun `GET users_(userName)_followers - returns followers for user`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)

        TestDataFactories.createUser(txn, "vinny", true)
        val brad = TestDataFactories.createUser(txn, "brad", true)
        TestDataFactories.createUser(txn, "dan", true)
        val alex = TestDataFactories.createUser(txn, "alex", true)
        TestDataFactories.createUser(txn, "abby", true)

        TestDataFactories.followUser(txn, brad.id, jeff.id)
        TestDataFactories.followUser(txn, alex.id, jeff.id)

        val resp = Unirest.get("$appUrl/users/jeff/followers").asString()
        assertEquals(200, resp.status)
        var body = objectMapper.readValue(resp.body, UserFollowingResponse::class.java)
        assertEquals(2, body.users.size)
        println(body.users)
        assertTrue(body.users.map { it.id }.contains(brad.id))
        assertTrue(body.users.map { it.id }.contains(alex.id))
    }

    @Test
    fun `GET users_(userName)_following - returns following for user`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)

        TestDataFactories.createUser(txn, "vinny", true)
        val brad = TestDataFactories.createUser(txn, "brad", true)
        TestDataFactories.createUser(txn, "dan", true)
        val alex = TestDataFactories.createUser(txn, "alex", true)
        TestDataFactories.createUser(txn, "abby", true)

        TestDataFactories.followUser(txn, jeff.id, brad.id)
        TestDataFactories.followUser(txn, jeff.id, alex.id)

        val resp = Unirest.get("$appUrl/users/jeff/following").asString()
        assertEquals(200, resp.status)
        var body = objectMapper.readValue(resp.body, UserFollowingResponse::class.java)
        assertEquals(2, body.users.size)
        assertTrue(body.users.map { it.id }.contains(brad.id))
        assertTrue(body.users.map { it.id }.contains(alex.id))
    }
}
