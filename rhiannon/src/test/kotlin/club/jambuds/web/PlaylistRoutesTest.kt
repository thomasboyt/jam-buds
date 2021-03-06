package club.jambuds.web

import club.jambuds.AppTest
import club.jambuds.helpers.TestDataFactories
import club.jambuds.model.User
import club.jambuds.responses.FeedPlaylistResponse
import kong.unirest.GetRequest
import kong.unirest.Unirest
import kong.unirest.json.JSONObject
import org.junit.jupiter.api.Test
import java.time.Instant
import java.time.format.DateTimeFormatter
import kotlin.test.assertEquals

class PlaylistRoutesTest : AppTest() {
    private fun forEachPlaylist(user: User, cb: (url: String) -> Unit) {
        val urls =
            listOf("feed", "public-feed", "playlists/${user.name}", "playlists/${user.name}/liked")
        urls.forEach { url ->
            try {
                cb(url)
            } catch (err: Throwable) {
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
        val mixtapeId = TestDataFactories.createMixtape(txn, jeff.id, true)
        TestDataFactories.createMixtapePost(txn, userId = jeff.id, mixtapeId = mixtapeId)

        fun assertLikes(req: GetRequest, likeCount: Int, isLiked: Boolean) {
            val mixtape = req.asJson().body.`object`
                .getJSONArray("items")
                .getJSONObject(0)
                .getJSONObject("mixtape")
            assertEquals(likeCount, mixtape.getJSONObject("meta").getInt("likeCount"))
            assertEquals(isLiked, mixtape.getJSONObject("meta").getBoolean("isLiked"))

            val song = req.asJson().body.`object`
                .getJSONArray("items")
                .getJSONObject(1)
                .getJSONObject("song")
            assertEquals(likeCount, song.getJSONObject("meta").getInt("likeCount"))
            assertEquals(isLiked, song.getJSONObject("meta").getBoolean("isLiked"))
        }

        forEachPlaylist(jeff) { url ->
            if (url == "playlists/jeff/liked") {
                // song hasn't been liked yet, so this one is empty
                return@forEachPlaylist
            }
            val req = getUserRequest(jeff, url)
            assertLikes(req, 0, false)
        }

        TestDataFactories.createSongLike(txn, userId = jeff.id, songId = songId)
        TestDataFactories.createMixtapeLike(txn, userId = jeff.id, mixtapeId = mixtapeId)

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
                .queryString("before", DateTimeFormatter.ISO_INSTANT.format(Instant.now()))
                .queryString("after", DateTimeFormatter.ISO_INSTANT.format(Instant.now()))
                .asJson()
            assertEquals(400, resp.status)
        }
    }

    @Test
    fun `all playlists - returns 400 for invalid timestamps`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)

        forEachPlaylist(jeff) { url ->
            var resp = getUserRequest(jeff, url)
                .queryString("before", "foo")
                .asString()
            assertEquals(400, resp.status)

            resp = getUserRequest(jeff, url)
                .queryString("after", "foo")
                .asString()
            assertEquals(400, resp.status)
        }
    }

    @Test
    fun `all playlists - allows pagination using a before timestamp`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val songIds = (1..50).map {
            Thread.sleep(1) // prevent creating songs at the "same time"
            val songId = TestDataFactories.createSong(txn)
            TestDataFactories.createSongPost(txn, userId = jeff.id, songId = songId)
            TestDataFactories.createSongLike(txn, userId = jeff.id, songId = songId)
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
                .queryString("before", timestampCursor)
                .asJson()
                .body.`object`
                .getJSONArray("items")
            val expectedSecondPageIds = songIds.reversed().slice(20..39)
            assertEquals(
                expectedSecondPageIds,
                secondPageItems.map {
                    (it as JSONObject).getJSONObject("song").getInt("id")
                }
            )
        }
    }

    @Test
    fun `all playlists - does not apply a limit when using an after timestamp`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val songIds = (1..50).map {
            val songId = TestDataFactories.createSong(txn)
            TestDataFactories.createSongPost(txn, userId = jeff.id, songId = songId)
            TestDataFactories.createSongLike(txn, userId = jeff.id, songId = songId)
            songId
        }

        forEachPlaylist(jeff) { url ->
            val req = getUserRequest(jeff, url)

            val items = req.asJson().body.`object`
                .getJSONArray("items")
            val firstPageCursor = (items.last() as JSONObject).getString("timestamp")

            val secondPageItems = getUserRequest(jeff, url)
                .queryString("before", firstPageCursor)
                .asJson()
                .body.`object`
                .getJSONArray("items")
            val secondPageCursor = (secondPageItems.last() as JSONObject).getString("timestamp")

            val afterItems = getUserRequest(jeff, url)
                .queryString("after", secondPageCursor)
                .asJson()
                .body.`object`
                .getJSONArray("items")

            // excludes the item with the timestamp used as the cursor
            val expectedAfterItems = songIds.reversed().slice(0..38)

            assertEquals(
                expectedAfterItems,
                afterItems.map {
                    (it as JSONObject).getJSONObject("song").getInt("id")
                }
            )
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
    fun `getPublicFeed - aggregates posts of the same song and sets timestamp to oldest post`() {
        val songId = TestDataFactories.createSong(txn)
        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val firstPost = TestDataFactories.createSongPost(
            txn,
            userId = jeff.id,
            songId = songId,
            note = "First post"
        )
        val vinny = TestDataFactories.createUser(txn, "vinny", true)
        TestDataFactories.createSongPost(
            txn,
            userId = vinny.id,
            songId = songId,
            note = "Second post"
        )

        val resp = Unirest.get("$appUrl/public-feed").asString()
        assertEquals(200, resp.status)
        val body = objectMapper.readValue(resp.body, FeedPlaylistResponse::class.java)

        assertEquals(1, body.items.size)
        val item = body.items[0]
        assertEquals(songId, item.song!!.id)
        assertEquals(firstPost.createdAt, item.timestamp)

        // Public feed does not contain note text
        assertEquals(2, item.posts.size)
        assertEquals("jeff", item.posts[0].userName)
        assertEquals(null, item.posts[0].noteText)
        assertEquals("vinny", item.posts[1].userName)
        assertEquals(null, item.posts[1].noteText)
    }

    @Test
    fun `GET public-feed - correctly aggregates profiles`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        TestDataFactories.createSongPost(
            txn,
            userId = jeff.id,
            songId = TestDataFactories.createSong(txn)
        )
        TestDataFactories.createSongPost(
            txn,
            userId = jeff.id,
            songId = TestDataFactories.createSong(txn)
        )

        val reusedSongId = TestDataFactories.createSong(txn)
        val vinny = TestDataFactories.createUser(txn, "vinny", true)
        val brad = TestDataFactories.createUser(txn, "brad", true)
        TestDataFactories.createSongPost(txn, userId = vinny.id, songId = reusedSongId)
        TestDataFactories.createSongPost(txn, userId = brad.id, songId = reusedSongId)
        TestDataFactories.createSongPost(txn, userId = jeff.id, songId = reusedSongId)

        val resp = Unirest.get("$appUrl/public-feed").asString()
        val body = objectMapper.readValue(resp.body, FeedPlaylistResponse::class.java)
        assertEquals(3, body.profiles.size)
        assertEquals(setOf(vinny.id, jeff.id, brad.id), body.profiles.map { it.id }.toSet())
    }

    @Test
    fun `GET feed - only includes posts from users the current user follows and their own`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val vinny = TestDataFactories.createUser(txn, "vinny", true)
        val brad = TestDataFactories.createUser(txn, "brad", true)
        val ben = TestDataFactories.createUser(txn, "ben", true)

        TestDataFactories.followUser(txn, jeff.id, vinny.id)
        TestDataFactories.followUser(txn, jeff.id, brad.id)

        TestDataFactories.createSongPost(
            txn,
            userId = jeff.id,
            songId = TestDataFactories.createSong(txn)
        )
        TestDataFactories.createSongPost(
            txn,
            userId = vinny.id,
            songId = TestDataFactories.createSong(txn)
        )
        TestDataFactories.createSongPost(
            txn,
            userId = brad.id,
            songId = TestDataFactories.createSong(txn)
        )
        TestDataFactories.createSongPost(
            txn,
            userId = ben.id,
            songId = TestDataFactories.createSong(txn)
        )

        val resp = getUserRequest(jeff, "feed").asString()
        val body = objectMapper.readValue(resp.body, FeedPlaylistResponse::class.java)

        assertEquals(3, body.items.size)
        assertEquals(
            listOf("brad", "vinny", "jeff"),
            body.items.map { it.posts[0].userName }
        )
    }

    @Test
    fun `GET feed - correctly aggregates and sets timestamps`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val vinny = TestDataFactories.createUser(txn, "vinny", true)
        val brad = TestDataFactories.createUser(txn, "brad", true)
        val ben = TestDataFactories.createUser(txn, "ben", true)

        TestDataFactories.followUser(txn, jeff.id, vinny.id)
        TestDataFactories.followUser(txn, jeff.id, brad.id)
        TestDataFactories.followUser(txn, jeff.id, ben.id)

        val sharedSongId = TestDataFactories.createSong(txn)

        // with only posts from other users: the oldest time is used
        val vinnyPost = TestDataFactories.createSongPost(
            txn,
            userId = vinny.id,
            songId = sharedSongId,
            note = "Vinny post"
        )
        TestDataFactories.createSongPost(
            txn,
            userId = brad.id,
            songId = sharedSongId,
            note = "Brad post"
        )

        var items = getUserRequest(jeff, "feed").asJson().body.`object`.getJSONArray("items")

        assertEquals(1, items.length())
        assertEquals(
            DateTimeFormatter.ISO_INSTANT.format(vinnyPost.createdAt),
            items.getJSONObject(0).getString("timestamp")
        )

        // with newest post from current user: the current user's time is used
        val jeffPost = TestDataFactories.createSongPost(
            txn,
            userId = jeff.id,
            songId = sharedSongId,
            note = "Jeff post"
        )

        items = getUserRequest(jeff, "feed").asJson().body.`object`.getJSONArray("items")

        assertEquals(1, items.length())
        assertEquals(
            DateTimeFormatter.ISO_INSTANT.format(jeffPost.createdAt),
            items.getJSONObject(0).getString("timestamp")
        )

        // with newest post from another user, but with a post from current user: the current user's
        // time is used
        TestDataFactories.createSongPost(
            txn,
            userId = ben.id,
            songId = sharedSongId,
            note = "Ben post"
        )

        val resp = getUserRequest(jeff, "feed").asString()
        assertEquals(200, resp.status)
        val body = objectMapper.readValue(resp.body, FeedPlaylistResponse::class.java)

        assertEquals(1, body.items.size)
        assertEquals(jeffPost.createdAt, body.items[0].timestamp)

        // assert notes are correctly assembled
        val expected = listOf(
            mapOf("userName" to "vinny", "noteText" to "Vinny post"),
            mapOf("userName" to "brad", "noteText" to "Brad post"),
            mapOf("userName" to "jeff", "noteText" to "Jeff post"),
            mapOf("userName" to "ben", "noteText" to "Ben post")
        )
        assertEquals(
            expected,
            body.items[0].posts.map { mapOf("userName" to it.userName, "noteText" to it.noteText) }
        )
    }

    @Test
    fun `GET playlists_(userName) - includes posts for user`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val jeffSongId = TestDataFactories.createSong(txn)
        TestDataFactories.createSongPost(
            txn,
            userId = jeff.id,
            songId = jeffSongId,
            note = "jeff post"
        )

        val vinny = TestDataFactories.createUser(txn, "vinny", true)
        val vinnySongId = TestDataFactories.createSong(txn)
        TestDataFactories.createSongPost(txn, userId = vinny.id, songId = vinnySongId)

        val resp = Unirest.get("$appUrl/playlists/jeff").asJson()

        val items = resp.body.`object`
            .getJSONArray("items")

        assertEquals(1, items.length())
        assertEquals(jeffSongId, items.getJSONObject(0).getJSONObject("song").getInt("id"))
        assertEquals("jeff post", items.getJSONObject(0).getString("noteText"))
    }

    @Test
    fun `GET playlists_(userName) - allows filtering to only mixtapes`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)

        val songId = TestDataFactories.createSong(txn)
        TestDataFactories.createSongPost(txn, userId = jeff.id, songId = songId)

        val mixtapeId = TestDataFactories.createMixtape(txn, userId = jeff.id, isPublished = true)
        TestDataFactories.createMixtapePost(txn, userId = jeff.id, mixtapeId = mixtapeId)

        val items = Unirest
            .get("$appUrl/playlists/jeff")
            .queryString("onlyMixtapes", "true")
            .asJson()
            .body.`object`.getJSONArray("items")

        assertEquals(1, items.length())
        assertEquals("mixtape", items.getJSONObject(0).getString("type"))
    }

    @Test
    fun `GET playlists_(userName)_likes - returns a user's likes`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)

        val vinny = TestDataFactories.createUser(txn, "vinny", true)
        val vinnySongId = TestDataFactories.createSong(txn)
        TestDataFactories.createSongPost(txn, userId = vinny.id, songId = vinnySongId)
        TestDataFactories.createSongLike(txn, userId = jeff.id, songId = vinnySongId)

        val resp = Unirest.get("$appUrl/playlists/jeff/liked").asJson()

        val items = resp.body.`object`
            .getJSONArray("items")

        assertEquals(1, items.length())
        assertEquals(vinnySongId, items.getJSONObject(0).getJSONObject("song").getInt("id"))
    }
}
