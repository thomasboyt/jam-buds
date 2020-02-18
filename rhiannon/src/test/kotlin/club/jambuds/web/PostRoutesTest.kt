package club.jambuds.web

import club.jambuds.AppTest
import club.jambuds.getGson
import club.jambuds.helpers.TestDataFactories
import club.jambuds.model.SongWithMeta
import club.jambuds.model.cache.SearchCacheEntry
import club.jambuds.responses.UserPlaylistResponse
import kong.unirest.Unirest
import kong.unirest.json.JSONObject
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

class PostRoutesTest : AppTest() {
    private val gson = getGson()

    @Test
    fun `POST posts - works`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val authToken = TestDataFactories.createAuthToken(txn, jeff.id)
        val track = TestDataFactories.createSpotifyTrack()

        val cacheEntry = SearchCacheEntry(
            spotify = track,
            isrc = "abcde",
            didHydrateExternalIds = true,
            appleMusicUrl = "12345",
            appleMusicId = "12345"
        )
        searchCacheDao.setSearchCacheEntry(track.id, cacheEntry)

        val resp = Unirest.post("$appUrl/posts")
            .header("X-Auth-Token", authToken)
            .body(JSONObject(mapOf("spotifyId" to track.id)))
            .asString()
        assertEquals(200, resp.status)
        val song = gson.fromJson(resp.body, SongWithMeta::class.java)

        val playlistResp = Unirest.get("$appUrl/playlists/jeff")
            .header("X-Auth-Token", authToken)
            .asString()
        assertEquals(200, playlistResp.status)
        val playlist = gson.fromJson(playlistResp.body, UserPlaylistResponse::class.java)
        assertEquals(1, playlist.items.size)
        assertEquals(song, playlist.items[0].song)
    }

    @Test
    fun `POST posts - prevents reposting same song`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val authToken = TestDataFactories.createAuthToken(txn, jeff.id)
        val track = TestDataFactories.createSpotifyTrack()

        val cacheEntry = SearchCacheEntry(
            spotify = track,
            isrc = "abcde",
            didHydrateExternalIds = true,
            appleMusicUrl = "12345",
            appleMusicId = "12345"
        )
        searchCacheDao.setSearchCacheEntry(track.id, cacheEntry)

        val resp = Unirest.post("$appUrl/posts")
            .header("X-Auth-Token", authToken)
            .body(JSONObject(mapOf("spotifyId" to track.id)))
            .asString()
        assertEquals(200, resp.status)

        val redoResp = Unirest.post("$appUrl/posts")
            .header("X-Auth-Token", authToken)
            .body(JSONObject(mapOf("spotifyId" to track.id)))
            .asString()
        assertEquals(400, redoResp.status)
    }
}
