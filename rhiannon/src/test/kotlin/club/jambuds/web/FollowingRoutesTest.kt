package club.jambuds.web

import club.jambuds.AppTest
import club.jambuds.helpers.TestDataFactories
import club.jambuds.model.NotificationType
import club.jambuds.responses.FollowUserResponse
import club.jambuds.responses.GetCurrentUserResponse
import club.jambuds.responses.NotificationItem
import kong.unirest.Unirest
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

class FollowingRoutesTest : AppTest() {
    @Test
    fun `PUT following_(userName) - follows a user`() {
        TestDataFactories.createUser(txn, "jeff", true)
        val vinny = TestDataFactories.createUser(txn, "vinny", true)
        val vinnyAuthToken = TestDataFactories.createAuthToken(txn, vinny.id)

        val resp = Unirest.put("$appUrl/following/jeff")
            .header("X-Auth-Token", vinnyAuthToken)
            .asString()
        assertEquals(200, resp.status)
        val body = objectMapper.readValue(resp.body, FollowUserResponse::class.java)
        assertEquals("jeff", body.user.name)

        val meResp = Unirest.get("$appUrl/me")
            .header("X-Auth-Token", vinnyAuthToken)
            .asString()
        assertEquals(200, meResp.status)
        val me = objectMapper.readValue(meResp.body, GetCurrentUserResponse::class.java)
        assertEquals("jeff", me.user!!.following[0].name)
    }

    @Test
    fun `PUT following_(userName) - creates following notification`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val jeffAuthToken = TestDataFactories.createAuthToken(txn, jeff.id)

        val vinny = TestDataFactories.createUser(txn, "vinny", true)
        val vinnyAuthToken = TestDataFactories.createAuthToken(txn, vinny.id)

        val resp = Unirest.put("$appUrl/following/jeff")
            .header("X-Auth-Token", vinnyAuthToken)
            .asString()
        assertEquals(200, resp.status)

        val notifications = getNotifications(jeffAuthToken)
        assertEquals(1, notifications.size)
        assertEquals(NotificationType.FOLLOW, notifications[0].type)
    }

    @Test
    fun `DELETE following_(userName) - unfollows a user`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val jeffAuthToken = TestDataFactories.createAuthToken(txn, jeff.id)
        val vinny = TestDataFactories.createUser(txn, "vinny", true)
        val vinnyAuthToken = TestDataFactories.createAuthToken(txn, vinny.id)

        val resp = Unirest.put("$appUrl/following/jeff")
            .header("X-Auth-Token", vinnyAuthToken)
            .asString()
        assertEquals(200, resp.status)

        val unfollowResp = Unirest.delete("$appUrl/following/jeff")
            .header("X-Auth-Token", jeffAuthToken)
            .asString()
        assertEquals(204, unfollowResp.status)

        val meResp = Unirest.get("$appUrl/me")
            .header("X-Auth-Token", jeffAuthToken)
            .asString()
        assertEquals(200, meResp.status)
        val me = objectMapper.readValue(meResp.body, GetCurrentUserResponse::class.java)
        assertEquals(0, me.user!!.following.size)
    }

    @Test
    fun `DELETE following_(userName) - removes following notification`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val jeffAuthToken = TestDataFactories.createAuthToken(txn, jeff.id)
        val vinny = TestDataFactories.createUser(txn, "vinny", true)
        val vinnyAuthToken = TestDataFactories.createAuthToken(txn, vinny.id)

        val resp = Unirest.put("$appUrl/following/jeff")
            .header("X-Auth-Token", vinnyAuthToken)
            .asString()
        assertEquals(200, resp.status)

        val unfollowResp = Unirest.delete("$appUrl/following/jeff")
            .header("X-Auth-Token", vinnyAuthToken)
            .asString()
        assertEquals(204, unfollowResp.status)

        val notifications = getNotifications(jeffAuthToken)
        assertEquals(0, notifications.size)
    }

    private fun getNotifications(authToken: String): List<NotificationItem> {
        val initialNotificationsResp = Unirest.get("$appUrl/notifications")
            .header("X-Auth-Token", authToken)
            .asString()
        assertEquals(200, initialNotificationsResp.status)

        return objectMapper
            .readValue(initialNotificationsResp.body, Array<NotificationItem>::class.java)
            .toList()
    }
}
