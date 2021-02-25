package club.jambuds.web

import club.jambuds.AppTest
import club.jambuds.getGson
import club.jambuds.helpers.TestDataFactories
import club.jambuds.responses.UserPlaylistResponse
import kong.unirest.Unirest
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

class LikeRoutesTest : AppTest() {
    private val gson = getGson()

    @Test
    fun `PUT likes_songs_(songId) - creates a like for a song`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val authToken = TestDataFactories.createAuthToken(txn, jeff.id)
        val songId = TestDataFactories.createSong(txn)

        val resp = Unirest.put("$appUrl/likes/songs/$songId")
            .header("X-Auth-Token", authToken)
            .asString()
        assertEquals(204, resp.status)

        val playlistResp = Unirest.get("$appUrl/playlists/jeff/liked")
            .header("X-Auth-Token", authToken)
            .asString()
        val playlist = gson.fromJson(playlistResp.body, UserPlaylistResponse::class.java)
        assertEquals(1, playlist.items.size)
        assertEquals(songId, playlist.items[0].song!!.id)
    }

    @Test
    fun `PUT likes_songs_(songId) - 404s for nonexistent song`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val authToken = TestDataFactories.createAuthToken(txn, jeff.id)

        val resp = Unirest.put("$appUrl/likes/songs/1234")
            .header("X-Auth-Token", authToken)
            .asString()
        assertEquals(404, resp.status)
    }

    @Test
    fun `PUT likes_songs_(songId) - 400s for existing like`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val authToken = TestDataFactories.createAuthToken(txn, jeff.id)
        val songId = TestDataFactories.createSong(txn)

        val resp = Unirest.put("$appUrl/likes/songs/$songId")
            .header("X-Auth-Token", authToken)
            .asString()
        assertEquals(204, resp.status)

        val retryResp = Unirest.put("$appUrl/likes/songs/$songId")
            .header("X-Auth-Token", authToken)
            .asString()
        assertEquals(400, retryResp.status)
    }

    @Test
    fun `DELETE likes_songs_(songId) - removes a like for a song`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val authToken = TestDataFactories.createAuthToken(txn, jeff.id)
        val songId = TestDataFactories.createSong(txn)
        TestDataFactories.createLike(txn, userId = jeff.id, songId = songId)

        val resp = Unirest.delete("$appUrl/likes/songs/$songId")
            .header("X-Auth-Token", authToken)
            .asString()
        assertEquals(204, resp.status)

        val playlistResp = Unirest.get("$appUrl/playlists/jeff/liked")
            .header("X-Auth-Token", authToken)
            .asString()
        val playlist = gson.fromJson(playlistResp.body, UserPlaylistResponse::class.java)
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
