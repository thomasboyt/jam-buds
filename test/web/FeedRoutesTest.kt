package web

import BaseTest
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import io.ktor.http.HttpMethod
import io.ktor.server.testing.*
import kotlin.test.*
import org.junit.jupiter.api.Test
import service.FeedEntryResource
import service.ListWithLimitResource

// via https://codereview.stackexchange.com/a/159531
inline fun <reified T> Gson.fromJsonToGeneric(json: String): T {
    return fromJson(json, object : TypeToken<T>() {}.type)
}

class FeedRoutesTest : BaseTest() {
    @Test
    fun `GET public-feed - returns json response`() = withTestApp {
        handleRequest(HttpMethod.Get, "/public-feed").apply {
            assertEquals(200, response.status()?.value)
            val gson = Gson()
            val expected = ListWithLimitResource(
                items = listOf<FeedEntryResource>(),
                limit = 20
            )
            val resp = gson.fromJsonToGeneric<ListWithLimitResource<FeedEntryResource>>(response.content!!)
            assertEquals(expected, resp)
        }
    }

    @Test
    fun `GET public-feed - returns 400 if both before and after timestamp are set`() = withTestApp {
        handleRequest(HttpMethod.Get, "/public-feed?beforeTimestamp=foo&afterTimestamp=bar").apply {
            assertEquals(400, response.status()?.value)
        }
    }

    @Test
    fun `GET public-feed - returns 400 for invalid timestamps`() = withTestApp {
        handleRequest(HttpMethod.Get, "/public-feed?beforeTimestamp=foo").apply {
            assertEquals(400, response.status()?.value)
        }

        handleRequest(HttpMethod.Get, "/public-feed?afterTimestamp=foo").apply {
            assertEquals(400, response.status()?.value)
        }
    }

    @Test
    fun `GET public-feed - returns 400 for invalid currentUserId`() = withTestApp {
        handleRequest(HttpMethod.Get, "/public-feed?currentUserId=1").apply {
            assertEquals(200, response.status()?.value)
        }

        handleRequest(HttpMethod.Get, "/public-feed?currentUserId=asdf").apply {
            assertEquals(400, response.status()?.value)
        }
    }
}

