package club.jambuds.web

import club.jambuds.AppTest
import club.jambuds.helpers.TestDataFactories
import club.jambuds.model.LikeSource
import club.jambuds.model.User
import club.jambuds.responses.UserPlaylistResponse
import kong.unirest.HttpResponse
import kong.unirest.Unirest
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class LikeRoutesTest : AppTest() {
    private fun createLike(path: String, authToken: String): HttpResponse<String> {
        return Unirest.put("$appUrl/likes/$path")
            .queryString("likeSource", LikeSource.POST)
            .queryString("sourceUserNames", listOf("vinny"))
            .header("X-Auth-Token", authToken)
            .asString()
    }

    private fun deleteLike(path: String, authToken: String): HttpResponse<String> {
        return Unirest.delete("$appUrl/likes/$path")
            .header("X-Auth-Token", authToken)
            .asString()
    }

    private data class TestLikeItemIds(val songId: Int, val mixtapeId: Int, val albumId: Int)
    private fun createTestLikes(user: User, authToken: String): TestLikeItemIds {
        val songId = TestDataFactories.createSong(txn)
        var resp =  createLike("songs/${songId}", authToken)
        assertEquals(204, resp.status)

        val mixtapeId = TestDataFactories.createMixtape(txn, user.id, true)
        resp = createLike("mixtapes/${mixtapeId}", authToken)
        assertEquals(204, resp.status)

        val album = TestDataFactories.createAlbum(txn)
        resp = createLike("albums/${album.id}", authToken)
        assertEquals(204, resp.status)

        return TestLikeItemIds(songId, mixtapeId, album.id)
    }

    @Test
    fun `PUT likes_(itemType)_(itemId) - creates a like for an item`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val authToken = TestDataFactories.createAuthToken(txn, jeff.id)

        val ids = createTestLikes(jeff, authToken)

        val playlistResp = Unirest.get("$appUrl/playlists/jeff/liked")
            .header("X-Auth-Token", authToken)
            .asString()
        val playlist = objectMapper.readValue(playlistResp.body, UserPlaylistResponse::class.java)
        assertEquals(3, playlist.items.size)
        assertTrue(playlist.items.any { it.song?.id == ids.songId})
        assertTrue(playlist.items.any { it.mixtape?.id == ids.mixtapeId})
        assertTrue(playlist.items.any { it.album?.id == ids.mixtapeId})
    }

    @Test
    fun `PUT likes_mixtapes_(songId) - prevents liking an unpublished mixtape`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val authToken = TestDataFactories.createAuthToken(txn, jeff.id)
        val mixtapeId = TestDataFactories.createMixtape(txn, jeff.id, false)

        val resp = Unirest.put("$appUrl/likes/mixtapes/$mixtapeId")
            .queryString("likeSource", LikeSource.POST)
            .queryString("sourceUserNames", listOf("vinny"))
            .header("X-Auth-Token", authToken)
            .asString()
        assertEquals(400, resp.status)
    }

    @Test
    fun `PUT likes_(itemType)_(itemId) - 404s for nonexistent items`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val authToken = TestDataFactories.createAuthToken(txn, jeff.id)

        fun should404(path: String) {
            val resp =  createLike(path, authToken)
            assertEquals(404, resp.status)
        }

        should404("songs/1234")
        should404("albums/1234")
        should404("mixtapes/1234")
    }

    @Test
    fun `PUT likes_(itemType)_(itemId) - 400s for existing like`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val authToken = TestDataFactories.createAuthToken(txn, jeff.id)
        val ids = createTestLikes(jeff, authToken)

        fun should400(path: String) {
            val resp =  createLike(path, authToken)
            assertEquals(400, resp.status)
        }

        should400("songs/${ids.songId}")
        should400("albums/${ids.albumId}")
        should400("mixtapes/${ids.mixtapeId}")
    }

    @Test
    fun `DELETE likes_(itemType)_(itemId) - removes a like for a song`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val authToken = TestDataFactories.createAuthToken(txn, jeff.id)
        val ids = createTestLikes(jeff, authToken)

        fun should204(path: String) {
            val resp = deleteLike(path, authToken)
            assertEquals(204, resp.status)
        }

        should204("songs/${ids.songId}")
        should204("albums/${ids.albumId}")
        should204("mixtapes/${ids.mixtapeId}")

        val playlistResp = Unirest.get("$appUrl/playlists/jeff/liked")
            .header("X-Auth-Token", authToken)
            .asString()
        val playlist = objectMapper.readValue(playlistResp.body, UserPlaylistResponse::class.java)
        assertEquals(0, playlist.items.size)
    }

    @Test
    fun `DELETE likes_songs_(songId) - 404s for a nonexistent like`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val authToken = TestDataFactories.createAuthToken(txn, jeff.id)
        val songId = TestDataFactories.createSong(txn)

        val resp = Unirest.delete("$appUrl/likes/songs/$songId")
            .header("X-Auth-Token", authToken)
            .asString()
        assertEquals(404, resp.status)
    }
}
