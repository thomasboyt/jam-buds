package web

import BaseTest

import io.ktor.http.HttpMethod
import io.ktor.server.testing.*
import kotlin.test.*

class FeedRoutesTest : BaseTest() {
    @Test
    fun `GET public-feed - returns json response`() = withTestApp {
        handleRequest(HttpMethod.Get, "/public-feed").apply {
            assertEquals("[]", response.content)
        }
    }

    @Test
    fun `GET public-feed - returns 400 if both before and after timestamp are set`() = withTestApp {
        handleRequest(HttpMethod.Get, "/public-feed?beforeTimestamp=foo&afterTimestamp=bar").apply {
            assertEquals(400, response.status()?.value)
        }
    }
}

