package club.jambuds.web

import club.jambuds.BaseTest
import club.jambuds.service.ListWithLimitResource
import club.jambuds.service.PlaylistEntryResource
import io.javalin.plugin.json.JavalinJson
import kong.unirest.Unirest
import org.junit.jupiter.api.Test
import java.time.Instant
import java.time.format.DateTimeFormatter
import kotlin.test.assertEquals

class PlaylistRoutesTest : BaseTest() {
    @Test
    fun `GET public-feed - returns json response`() = withTestApp {
        val resp = Unirest.get("$appUrl/public-feed").asString()
        assertEquals(resp.status, 200)
        val expected = ListWithLimitResource(
            items = listOf<PlaylistEntryResource>(),
            limit = 20
        )
        assertEquals(JavalinJson.toJson(expected), resp.body)
    }

    @Test
    fun `GET public-feed - returns 400 if both before and after timestamp are set`() = withTestApp {
        val resp = Unirest.get("$appUrl/public-feed")
            .queryString("beforeTimestamp", DateTimeFormatter.ISO_INSTANT.format(Instant.now()))
            .queryString("afterTimestamp", DateTimeFormatter.ISO_INSTANT.format(Instant.now()))
            .asString()
        assertEquals(resp.status, 400)
    }

    @Test
    fun `GET public-feed - returns 400 for invalid timestamps`() = withTestApp {
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
