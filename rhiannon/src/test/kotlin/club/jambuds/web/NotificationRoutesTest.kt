package club.jambuds.web

import club.jambuds.AppTest
import club.jambuds.getGson
import club.jambuds.helpers.TestDataFactories
import club.jambuds.responses.NotificationItem
import kong.unirest.Unirest
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

class NotificationRoutesTest : AppTest() {
    private val gson = getGson()

    private fun getNotifications(authToken: String): List<NotificationItem> {
        val initialNotificationsResp = Unirest.get("$appUrl/notifications")
            .header("X-Auth-Token", authToken)
            .asString()
        assertEquals(200, initialNotificationsResp.status)

        return gson.fromJson(initialNotificationsResp.body, Array<NotificationItem>::class.java).toList()
    }

    @Test
    fun `GET notifications - returns 0 new notifications if none present`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val authToken = TestDataFactories.createAuthToken(txn, jeff.id)

        val items = getNotifications(authToken)
        assertEquals(0, items.size)
    }

    @Test
    fun `GET notifications - returns only new notifications`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val jeffAuthToken = TestDataFactories.createAuthToken(txn, jeff.id)

        val vinny = TestDataFactories.createUser(txn, "vinny", true)
        followingService.followUser(vinny.id, jeff.name)

        var items = getNotifications(jeffAuthToken)
        assertEquals(1, items.size)
        assertEquals("vinny", items[0].user!!.name)

        val markReadResp = Unirest.post("$appUrl/notifications/mark-all-read")
            .header("X-Auth-Token", jeffAuthToken)
            .asString()
        assertEquals(204, markReadResp.status)

        items = getNotifications(jeffAuthToken)
        assertEquals(0, items.size)

        val brad = TestDataFactories.createUser(txn, "brad", true)
        followingService.followUser(brad.id, jeff.name)

        val resp = Unirest.get("$appUrl/notifications")
            .header("X-Auth-Token", jeffAuthToken)
            .asString()
        assertEquals(200, resp.status)

        items = getNotifications(jeffAuthToken)
        assertEquals(1, items.size)
        assertEquals("brad", items[0].user!!.name)
    }

    @Test
    fun `POST notifications_mark-all-read - marks all notifications as read`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val jeffAuthToken = TestDataFactories.createAuthToken(txn, jeff.id)

        val vinny = TestDataFactories.createUser(txn, "vinny", true)
        followingService.followUser(vinny.id, jeff.name)

        val markReadResp = Unirest.post("$appUrl/notifications/mark-all-read")
            .header("X-Auth-Token", jeffAuthToken)
            .asString()
        assertEquals(204, markReadResp.status)

        val resp = Unirest.get("$appUrl/notifications")
            .header("X-Auth-Token", jeffAuthToken)
            .asString()
        assertEquals(200, resp.status)

        val items = gson.fromJson(resp.body, Array<NotificationItem>::class.java).toList()
        assertEquals(0, items.size)
    }
}
