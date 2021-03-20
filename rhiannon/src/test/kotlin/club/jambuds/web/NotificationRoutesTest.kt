package club.jambuds.web

import club.jambuds.AppTest
import club.jambuds.helpers.TestDataFactories
import club.jambuds.responses.NotificationItem
import kong.unirest.Unirest
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

class NotificationRoutesTest : AppTest() {
    private fun getNotifications(authToken: String): List<NotificationItem> {
        val initialNotificationsResp = Unirest.get("$appUrl/notifications")
            .header("X-Auth-Token", authToken)
            .asString()
        assertEquals(200, initialNotificationsResp.status)

        return objectMapper
            .readValue(initialNotificationsResp.body, Array<NotificationItem>::class.java)
            .toList()
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

        // create follow notifications
        val vinny = TestDataFactories.createUser(txn, "vinny", true)
        followingService.followUser(vinny.id, jeff.name)
        val brad = TestDataFactories.createUser(txn, "brad", true)
        followingService.followUser(brad.id, jeff.name)
        followingService.followUser(vinny.id, brad.name)
        val bradAuthToken = TestDataFactories.createAuthToken(txn, brad.id)

        val markReadResp = Unirest.post("$appUrl/notifications/mark-all-read")
            .header("X-Auth-Token", jeffAuthToken)
            .asString()
        assertEquals(204, markReadResp.status)

        // jeff should have 0 items...
        val jeffResp = Unirest.get("$appUrl/notifications")
            .header("X-Auth-Token", jeffAuthToken)
            .asString()
        assertEquals(200, jeffResp.status)

        val jeffItems = objectMapper.readValue(jeffResp.body, Array<NotificationItem>::class.java).toList()
        assertEquals(0, jeffItems.size)

        // ...while brad still has one
        val bradResp = Unirest.get("$appUrl/notifications")
            .header("X-Auth-Token", bradAuthToken)
            .asString()
        assertEquals(200, bradResp.status)

        val bradItems = objectMapper.readValue(bradResp.body, Array<NotificationItem>::class.java).toList()
        assertEquals(1, bradItems.size)
    }

    @Test
    fun `POST notifications_(id)_read - marks one notification as read`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val jeffAuthToken = TestDataFactories.createAuthToken(txn, jeff.id)

        // create follow notifications
        val vinny = TestDataFactories.createUser(txn, "vinny", true)
        followingService.followUser(vinny.id, jeff.name)
        val brad = TestDataFactories.createUser(txn, "brad", true)
        followingService.followUser(brad.id, jeff.name)

        val initResp = Unirest.get("$appUrl/notifications")
            .header("X-Auth-Token", jeffAuthToken)
            .asString()
        assertEquals(200, initResp.status)

        val initItems = objectMapper.readValue(initResp.body, Array<NotificationItem>::class.java).toList()
        assertEquals(2, initItems.size)

        val firstItemId = initItems[0].id
        val secondItemId = initItems[1].id

        val markReadResp = Unirest.post("$appUrl/notifications/$firstItemId/read")
            .header("X-Auth-Token", jeffAuthToken)
            .asString()
        assertEquals(204, markReadResp.status)

        val afterResp = Unirest.get("$appUrl/notifications")
            .header("X-Auth-Token", jeffAuthToken)
            .asString()
        assertEquals(200, afterResp.status)

        val afterItems = objectMapper.readValue(afterResp.body, Array<NotificationItem>::class.java).toList()
        assertEquals(1, afterItems.size)
        assertEquals(secondItemId, afterItems[0].id)
    }

    @Test
    fun `POST notifications_(id)_read - does not allow updates from other users`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val jeffAuthToken = TestDataFactories.createAuthToken(txn, jeff.id)
        val vinny = TestDataFactories.createUser(txn, "vinny", true)
        val vinnyAuthToken = TestDataFactories.createAuthToken(txn, vinny.id)
        followingService.followUser(vinny.id, jeff.name)

        val initResp = Unirest.get("$appUrl/notifications")
            .header("X-Auth-Token", jeffAuthToken)
            .asString()
        assertEquals(200, initResp.status)
        val items = objectMapper.readValue(initResp.body, Array<NotificationItem>::class.java).toList()
        val notificationId = items[0].id

        val resp = Unirest.post("$appUrl/notifications/$notificationId/read")
            .header("X-Auth-Token", vinnyAuthToken)
            .asString()
        assertEquals(404, resp.status)
    }
}
