package club.jambuds.web

import club.jambuds.AppTest
import club.jambuds.helpers.TestDataFactories
import club.jambuds.responses.FeedPlaylistResponse
import club.jambuds.responses.UserPlaylistResponse
import club.jambuds.responses.UserProfile
import io.javalin.plugin.json.JavalinJson
import kong.unirest.Unirest
import org.junit.jupiter.api.Test
import java.time.Instant
import java.time.format.DateTimeFormatter
import kotlin.test.assertEquals

class PlaylistRoutesTest : AppTest() {
    @Test
    fun `GET public-feed - returns json response`() {
        val resp = Unirest.get("$appUrl/public-feed").asString()
        assertEquals(resp.status, 200)
        val expected = FeedPlaylistResponse(
            items = emptyList(),
            limit = 20
        )
        assertEquals(JavalinJson.toJson(expected), resp.body)
    }

    @Test
    fun `GET public-feed - returns 400 if both before and after timestamp are set`() {
        val resp = Unirest.get("$appUrl/public-feed")
            .queryString("beforeTimestamp", DateTimeFormatter.ISO_INSTANT.format(Instant.now()))
            .queryString("afterTimestamp", DateTimeFormatter.ISO_INSTANT.format(Instant.now()))
            .asString()
        assertEquals(resp.status, 400)
    }

    @Test
    fun `GET public-feed - returns 400 for invalid timestamps`() {
        var resp = Unirest.get("$appUrl/public-feed")
            .queryString("beforeTimestamp", "foo")
            .asString()
        assertEquals(400, resp.status)

        resp = Unirest.get("$appUrl/public-feed")
            .queryString("afterTimestamp", "foo")
            .asString()
        assertEquals(400, resp.status)
    }

    @Test
    fun `GET playlists_(userName) - includes user profile`() {
        var user = TestDataFactories.createUser(txn, "jeff", true)

        val resp = Unirest.get("$appUrl/playlists/jeff").asString()
        assertEquals(200, resp.status)
        val expected = UserPlaylistResponse(
            items = emptyList(),
            limit = 20,
            userProfile = UserProfile(id = user.id, name = user.name)
        )
        assertEquals(JavalinJson.toJson(expected), resp.body)
    }
}
