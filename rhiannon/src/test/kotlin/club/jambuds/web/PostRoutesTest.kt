package club.jambuds.web

import club.jambuds.AppTest
import club.jambuds.helpers.TestDataFactories
import club.jambuds.model.PostReport
import club.jambuds.model.SongWithMeta
import club.jambuds.model.cache.SpotifyTrackSearchCache
import club.jambuds.responses.UserPlaylistResponse
import com.nhaarman.mockitokotlin2.times
import com.nhaarman.mockitokotlin2.verify
import kong.unirest.Unirest
import kong.unirest.json.JSONObject
import org.jdbi.v3.core.kotlin.withHandleUnchecked
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

class PostRoutesTest : AppTest() {
    @Test
    fun `POST posts - works`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val authToken = TestDataFactories.createAuthToken(txn, jeff.id)
        val track = TestDataFactories.createSpotifyTrack()

        val cacheEntry = SpotifyTrackSearchCache(
            spotify = track,
            isrc = "abcde",
            didHydrateExternalIds = true,
            appleMusicUrl = "12345",
            appleMusicId = "12345"
        )
        searchCacheDao.setSpotifyTrackSearchCache(track.id, cacheEntry)

        val resp = Unirest.post("$appUrl/posts")
            .header("X-Auth-Token", authToken)
            .body(
                JSONObject(
                    mapOf(
                        "type" to "song",
                        "spotifyId" to track.id,
                        "noteText" to "Hello world",
                        "postTweet" to false
                    )
                )
            )
            .asString()
        assertEquals(200, resp.status)
        val song = objectMapper.readValue(resp.body, SongWithMeta::class.java)

        val playlistResp = Unirest.get("$appUrl/playlists/jeff")
            .header("X-Auth-Token", authToken)
            .asString()
        assertEquals(200, playlistResp.status)
        val playlist = objectMapper.readValue(playlistResp.body, UserPlaylistResponse::class.java)
        assertEquals(1, playlist.items.size)
        assertEquals("Hello world", playlist.items[0].noteText)
        assertEquals(song, playlist.items[0].song)
    }

    @Test
    fun `POST posts - prevents reposting same song`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val authToken = TestDataFactories.createAuthToken(txn, jeff.id)
        val track = TestDataFactories.createSpotifyTrack()

        val cacheEntry = SpotifyTrackSearchCache(
            spotify = track,
            isrc = "abcde",
            didHydrateExternalIds = true,
            appleMusicUrl = "12345",
            appleMusicId = "12345"
        )
        searchCacheDao.setSpotifyTrackSearchCache(track.id, cacheEntry)

        val resp = Unirest.post("$appUrl/posts")
            .header("X-Auth-Token", authToken)
            .body(JSONObject(mapOf("spotifyId" to track.id, "postTweet" to false, "type" to "song")))
            .asString()
        assertEquals(200, resp.status)

        val redoResp = Unirest.post("$appUrl/posts")
            .header("X-Auth-Token", authToken)
            .body(JSONObject(mapOf("spotifyId" to track.id, "postTweet" to false, "type" to "song")))
            .asString()
        assertEquals(400, redoResp.status)
    }

    @Test
    fun `POST posts - sends tweet with post`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true, hasTwitter = true)
        val authToken = TestDataFactories.createAuthToken(txn, jeff.id)
        val track = TestDataFactories.createSpotifyTrack()

        val cacheEntry = SpotifyTrackSearchCache(
            spotify = track,
            isrc = "abcde",
            didHydrateExternalIds = true,
            appleMusicUrl = "12345",
            appleMusicId = "12345"
        )
        searchCacheDao.setSpotifyTrackSearchCache(track.id, cacheEntry)

        val resp = Unirest.post("$appUrl/posts")
            .header("X-Auth-Token", authToken)
            .body(
                JSONObject(
                    mapOf(
                        "type" to "song",
                        "spotifyId" to track.id,
                        "noteText" to "Hello world",
                        "postTweet" to true
                    )
                )
            )
            .asString()
        assertEquals(200, resp.status)
        val song = objectMapper.readValue(resp.body, SongWithMeta::class.java)

        val expectedTweet = "Hello world http://localhost:8080/users/jeff?song=${song.id}"
        verify(mockTwitterService, times(1)).postTweet(jeff, expectedTweet)
    }

    @Test
    fun `DELETE posts_(postId) - deletes post`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val authToken = TestDataFactories.createAuthToken(txn, jeff.id)
        val songId = TestDataFactories.createSong(txn, spotifyId = "someSongId")
        val post = TestDataFactories.createSongPost(txn, songId = songId, userId = jeff.id)

        val resp = Unirest.delete("$appUrl/posts/${post.id}")
            .header("X-Auth-Token", authToken)
            .asString()
        assertEquals(204, resp.status)

        val playlistResp = Unirest.get("$appUrl/playlists/jeff")
            .header("X-Auth-Token", authToken)
            .asString()
        val playlist = objectMapper.readValue(playlistResp.body, UserPlaylistResponse::class.java)
        assertEquals(0, playlist.items.size)
    }

    @Test
    fun `DELETE posts_(postId) - returns 401 when deleting someone else's post`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val vinny = TestDataFactories.createUser(txn, "vinny", true)
        val authToken = TestDataFactories.createAuthToken(txn, vinny.id)
        val songId = TestDataFactories.createSong(txn, spotifyId = "someSongId")
        val post = TestDataFactories.createSongPost(txn, songId = songId, userId = jeff.id)

        val resp = Unirest.delete("$appUrl/posts/${post.id}")
            .header("X-Auth-Token", authToken)
            .asString()
        assertEquals(401, resp.status)
    }

    @Test
    fun `DELETE posts_(postId) - returns 404 when deleting nonexistent post`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val authToken = TestDataFactories.createAuthToken(txn, jeff.id)

        val resp = Unirest.delete("$appUrl/posts/1234")
            .header("X-Auth-Token", authToken)
            .asString()
        assertEquals(404, resp.status)
    }

    @Test
    fun `PUT posts_(postId)_report - creates a new report`() {
        val vinny = TestDataFactories.createUser(txn, "vinny", true)
        val songId = TestDataFactories.createSong(txn, spotifyId = "someSongId")
        val post = TestDataFactories.createSongPost(txn, songId = songId, userId = vinny.id)
        val postId = post.id

        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val authToken = TestDataFactories.createAuthToken(txn, jeff.id)
        val resp = Unirest.put("$appUrl/posts/$postId/report")
            .header("X-Auth-Token", authToken)
            .asString()
        assertEquals(204, resp.status)

        jdbi.withHandleUnchecked { handle ->
            val report = handle.select("select * from post_reports")
                .mapTo(PostReport::class.java)
                .one()
            assertEquals(postId, report.postId)
            assertEquals(jeff.id, report.reporterUserId)
        }
    }

    @Test
    fun `PUT posts_(postId)_report - only creates one report per reporter & post`() {
        val vinny = TestDataFactories.createUser(txn, "vinny", true)
        val songId = TestDataFactories.createSong(txn, spotifyId = "someSongId")
        val post = TestDataFactories.createSongPost(txn, songId = songId, userId = vinny.id)
        val postId = post.id

        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val authToken = TestDataFactories.createAuthToken(txn, jeff.id)
        val resp = Unirest.put("$appUrl/posts/$postId/report")
            .header("X-Auth-Token", authToken)
            .asString()
        assertEquals(204, resp.status)

        val resp2 = Unirest.put("$appUrl/posts/$postId/report")
            .header("X-Auth-Token", authToken)
            .asString()
        assertEquals(204, resp2.status)

        jdbi.withHandleUnchecked { handle ->
            val count = handle.select("select COUNT(*) from post_reports")
                .mapTo(Int::class.java)
                .one()
            assertEquals(1, count)
        }
    }

    @Test
    fun `PUT posts_(postId)_report - returns 404 for nonexistent posts`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val authToken = TestDataFactories.createAuthToken(txn, jeff.id)

        val resp = Unirest.put("$appUrl/posts/1234/report")
            .header("X-Auth-Token", authToken)
            .asString()
        assertEquals(404, resp.status)
    }
}
