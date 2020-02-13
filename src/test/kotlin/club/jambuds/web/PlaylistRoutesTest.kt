package club.jambuds.web

import club.jambuds.WebTest
import club.jambuds.responses.FeedPlaylistResponse
import io.javalin.plugin.json.JavalinJson
import kong.unirest.Unirest
import org.junit.jupiter.api.Test
import java.time.Instant
import java.time.format.DateTimeFormatter
import kotlin.test.assertEquals

class PlaylistRoutesTest : WebTest() {
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
        assertEquals(resp.status, 400)

        resp = Unirest.get("$appUrl/public-feed")
            .queryString("afterTimestamp", "foo")
            .asString()
        assertEquals(resp.status, 400)
    }
}
