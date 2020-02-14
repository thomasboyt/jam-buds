package club.jambuds.web

import club.jambuds.AppTest
import club.jambuds.helpers.TestDataFactories
import club.jambuds.model.User
import club.jambuds.responses.UserPlaylistResponse
import club.jambuds.responses.UserProfile
import io.javalin.plugin.json.JavalinJson
import kong.unirest.GetRequest
import kong.unirest.Unirest
import kong.unirest.json.JSONObject
import org.junit.jupiter.api.Test
import java.lang.AssertionError
import java.lang.Exception
import java.time.Instant
import java.time.format.DateTimeFormatter
import kotlin.test.assertEquals

class PlaylistRoutesTest : AppTest() {
    private fun forEachPlaylist(user: User, cb: (url: String) -> Unit) {
        val urls = listOf("feed", "public-feed", "playlists/${user.name}")
        urls.forEach { url ->
            try {
                cb(url)
            } catch (err: AssertionError) {
                throw Error("forEachPlaylist(): Error in /$url (see original exception below)", err)
            }
        }
    }

    private fun getUserRequest(user: User, url: String): GetRequest {
        val authToken = TestDataFactories.createAuthToken(txn, user.id)
        return Unirest.get("$appUrl/$url").header("X-Auth-Token", authToken)
    }

    @Test
    fun `all playlists - returns empty list when no posts present`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)

        forEachPlaylist(jeff) { url ->
            val req = getUserRequest(jeff, url)
            val items = req.asJson().body.`object`
                .getJSONArray("items")
            assertEquals(0, items.length())
        }
    }

    @Test
    fun `all playlists - sets likeCount & isLiked correctly`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val songId = TestDataFactories.createSong(txn)
        TestDataFactories.createSongPost(txn, userId = jeff.id, songId = songId)

        fun assertLikes(req: GetRequest, likeCount: Int, isLiked: Boolean) {
            val song = req.asJson().body.`object`
                .getJSONArray("items")
                .getJSONObject(0)
                .getJSONObject("song")
            assertEquals(likeCount, song.getInt("likeCount"))
            assertEquals(isLiked, song.getBoolean("isLiked"))
        }

        forEachPlaylist(jeff) { url ->
            val req = getUserRequest(jeff, url)
            assertLikes(req, 0, false)
        }

        TestDataFactories.createLike(txn, userId = jeff.id, songId = songId)

        forEachPlaylist(jeff) { url ->
            val req = getUserRequest(jeff, url)
            assertLikes(req, 1, true)
        }
    }

    @Test
    fun `all playlists - returns 400 if both before and after timestamp are set`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)

        forEachPlaylist(jeff) { url ->
            val req = getUserRequest(jeff, url)
            val resp = req
                .queryString("beforeTimestamp", DateTimeFormatter.ISO_INSTANT.format(Instant.now()))
                .queryString("afterTimestamp", DateTimeFormatter.ISO_INSTANT.format(Instant.now()))
                .asJson()
            assertEquals(resp.status, 400)
        }
    }

    @Test
    fun `all playlists - returns 400 for invalid timestamps`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)

        forEachPlaylist(jeff) { url ->
            var resp = getUserRequest(jeff, url)
                .queryString("beforeTimestamp", "foo")
                .asString()
            assertEquals(400, resp.status)

            resp = getUserRequest(jeff, url)
                .queryString("afterTimestamp", "foo")
                .asString()
            assertEquals(400, resp.status)
        }
    }

    @Test
    fun `all playlists - allows pagination using a before timestamp`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val songIds = (1..50).map {
            val songId = TestDataFactories.createSong(txn)
            TestDataFactories.createSongPost(txn, userId = jeff.id, songId = songId)
            TestDataFactories.createLike(txn, userId = jeff.id, songId = songId)
            songId
        }

        forEachPlaylist(jeff) { url ->
            val req = getUserRequest(jeff, url)

            val items = req.asJson().body.`object`
                .getJSONArray("items")
            val expectedFirstPageIds = songIds.reversed().slice(0..19)
            assertEquals(
                expectedFirstPageIds,
                items.map { (it as JSONObject).getJSONObject("song").getInt("id") }
            )

            val timestampCursor = (items.last() as JSONObject).getString("timestamp")
            val secondPageItems = getUserRequest(jeff, url)
                .queryString("beforeTimestamp", timestampCursor)
                .asJson()
                .body.`object`
                .getJSONArray("items")
            val expectedSecondPageIds = songIds.reversed().slice(20..39)
            assertEquals(expectedSecondPageIds, secondPageItems.map {
                (it as JSONObject).getJSONObject("song").getInt("id")
            })
        }
    }

    @Test
    fun `getPublicFeed - does not apply a limit when using an after timestamp`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val songIds = (1..50).map {
            val songId = TestDataFactories.createSong(txn)
            TestDataFactories.createSongPost(txn, userId = jeff.id, songId = songId)
            TestDataFactories.createLike(txn, userId = jeff.id, songId = songId)
            songId
        }

        forEachPlaylist(jeff) { url ->
            val req = getUserRequest(jeff, url)

            val items = req.asJson().body.`object`
                .getJSONArray("items")
            val firstPageCursor = (items.last() as JSONObject).getString("timestamp")

            val secondPageItems = getUserRequest(jeff, url)
                .queryString("beforeTimestamp", firstPageCursor)
                .asJson()
                .body.`object`
                .getJSONArray("items")
            val secondPageCursor = (secondPageItems.last() as JSONObject).getString("timestamp")

            val afterItems = getUserRequest(jeff, url)
                .queryString("afterTimestamp", secondPageCursor)
                .asJson()
                .body.`object`
                .getJSONArray("items")

            // excludes the item with the timestamp used as the cursor
            val expectedAfterItems = songIds.reversed().slice(0..38)

            assertEquals(expectedAfterItems, afterItems.map {
                (it as JSONObject).getJSONObject("song").getInt("id")
            })
        }
    }

    @Test
    fun `GET public-feed - returns only public feed entries`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val publicSongId = TestDataFactories.createSong(txn)
        TestDataFactories.createSongPost(txn, userId = jeff.id, songId = publicSongId)

        val vinny = TestDataFactories.createUser(txn, "vinny", false)
        val privateSongId = TestDataFactories.createSong(txn)
        TestDataFactories.createSongPost(txn, userId = vinny.id, songId = privateSongId)

        val resp = Unirest.get("$appUrl/public-feed").asJson()

        val items = resp.body.`object`
            .getJSONArray("items")

        assertEquals(1, items.length())
        assertEquals(publicSongId, items.getJSONObject(0).getJSONObject("song").getInt("id"))
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
