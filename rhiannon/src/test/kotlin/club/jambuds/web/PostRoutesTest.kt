package club.jambuds.web

import club.jambuds.AppTest
import club.jambuds.getGson
import club.jambuds.helpers.TestDataFactories
import club.jambuds.model.SongWithMeta
import club.jambuds.model.cache.SearchCacheEntry
import club.jambuds.responses.UserPlaylistResponse
import com.nhaarman.mockitokotlin2.times
import com.nhaarman.mockitokotlin2.verify
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
            .body(
                JSONObject(
                    mapOf(
                        "spotifyId" to track.id,
                        "noteText" to "Hello world",
                        "postTweet" to false
                    )
                )
            )
            .asString()
        assertEquals(200, resp.status)
        val song = gson.fromJson(resp.body, SongWithMeta::class.java)

        val playlistResp = Unirest.get("$appUrl/playlists/jeff")
            .header("X-Auth-Token", authToken)
            .asString()
        assertEquals(200, playlistResp.status)
        val playlist = gson.fromJson(playlistResp.body, UserPlaylistResponse::class.java)
        assertEquals(1, playlist.items.size)
        assertEquals("Hello world", playlist.items[0].noteText)
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
            .body(JSONObject(mapOf("spotifyId" to track.id, "postTweet" to false)))
            .asString()
        assertEquals(200, resp.status)

        val redoResp = Unirest.post("$appUrl/posts")
            .header("X-Auth-Token", authToken)
            .body(JSONObject(mapOf("spotifyId" to track.id, "postTweet" to false)))
            .asString()
        assertEquals(400, redoResp.status)
    }

    @Test
    fun `POST posts - sends tweet with post`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true, hasTwitter = true)
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
            .body(
                JSONObject(
                    mapOf(
                        "spotifyId" to track.id,
                        "noteText" to "Hello world",
                        "postTweet" to true
                    )
                )
            )
            .asString()
        assertEquals(200, resp.status)
        val song = gson.fromJson(resp.body, SongWithMeta::class.java)

        val expectedTweet = "Hello world http://localhost:8080/users/jeff?song=${song.id}"
        verify(mockTwitterService, times(1)).postTweet(jeff, expectedTweet)
    }

    @Test
    fun `DELETE posts_(postId) - deletes post`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val authToken = TestDataFactories.createAuthToken(txn, jeff.id)
        val songId = TestDataFactories.createSong(txn, spotifyId = "someSongId")
        TestDataFactories.createSongPost(txn, songId = songId, userId = jeff.id)

        val resp = Unirest.delete("$appUrl/posts/$songId")
            .header("X-Auth-Token", authToken)
            .asString()
        assertEquals(204, resp.status)

        val playlistResp = Unirest.get("$appUrl/playlists/jeff")
            .header("X-Auth-Token", authToken)
            .asString()
        val playlist = gson.fromJson(playlistResp.body, UserPlaylistResponse::class.java)
        assertEquals(0, playlist.items.size)
    }

    @Test
    fun `DELETE posts_(postId) - returns 404 when post does not exist`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val authToken = TestDataFactories.createAuthToken(txn, jeff.id)

        val resp = Unirest.delete("$appUrl/posts/1234")
            .header("X-Auth-Token", authToken)
            .asString()
        assertEquals(404, resp.status)
    }
}
