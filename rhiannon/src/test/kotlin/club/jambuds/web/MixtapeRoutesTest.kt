package club.jambuds.web

import club.jambuds.AppTest
import club.jambuds.getGson
import club.jambuds.helpers.TestDataFactories
import club.jambuds.model.SongWithMeta
import club.jambuds.model.cache.SearchCacheEntry
import club.jambuds.responses.MixtapeWithSongsReponse
import kong.unirest.HttpRequest
import kong.unirest.HttpRequestWithBody
import kong.unirest.HttpResponse
import kong.unirest.Unirest
import kong.unirest.json.JSONObject
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

class MixtapeRoutesTest : AppTest() {
    val gson = getGson()

    @Test
    fun `GET mixtapes_(id) - works`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val mixtapeId = TestDataFactories.createMixtape(txn, jeff.id, true)
        val songId = TestDataFactories.createSong(txn)
        TestDataFactories.addSongToMixtape(txn, mixtapeId = mixtapeId, songId = songId, rank = 1)

        val resp = Unirest.get("$appUrl/mixtapes/$mixtapeId")
            .asString()
        assertEquals(200, resp.status)
        val body = gson.fromJson(resp.body, MixtapeWithSongsReponse::class.java)
        assertEquals(1, body.tracks.size)
    }

    @Test
    fun `GET mixtapes_(id) - prevents unauthorized users from getting draft mixtapes`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val mixtapeId = TestDataFactories.createMixtape(txn, jeff.id, false)
        val songId = TestDataFactories.createSong(txn)
        TestDataFactories.addSongToMixtape(txn, mixtapeId = mixtapeId, songId = songId, rank = 1)

        val vinny = TestDataFactories.createUser(txn, "vinny", true)
        val authToken = TestDataFactories.createAuthToken(txn, vinny.id)
        val resp = Unirest.get("$appUrl/mixtapes/$mixtapeId")
            .header("X-Auth-Token", authToken)
            .asString()
        assertEquals(404, resp.status)
    }

    @Test
    fun `POST mixtapes - works`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val authToken = TestDataFactories.createAuthToken(txn, jeff.id)

        val resp = Unirest.post("$appUrl/mixtapes")
            .header("X-Auth-Token", authToken)
            .body(JSONObject(mapOf("title" to "A mixtape")))
            .asString()
        assertEquals(200, resp.status)

        val body = gson.fromJson(resp.body, MixtapeWithSongsReponse::class.java)
        assertEquals("jeff", body.author.name)
        assertEquals("A mixtape", body.title)
        assertEquals("a-mixtape", body.slug)
        assertEquals(false, body.isPublished)
        assertEquals(0, body.tracks.size)
    }

    @Test
    fun `DELETE mixtapes_(id) - works`() {
        fun getPostCount(): Int {
            return txn.select("select count(*) from posts").mapTo(Int::class.java).one()
        }

        fun getMixtapeCount(): Int {
            return txn.select("select count(*) from mixtapes").mapTo(Int::class.java).one()
        }

        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val mixtapeId = TestDataFactories.createMixtape(txn, jeff.id, true)
        TestDataFactories.createMixtapePost(txn, mixtapeId = mixtapeId, userId = jeff.id)

        assertEquals(1, getPostCount())
        assertEquals(1, getMixtapeCount())

        val authToken = TestDataFactories.createAuthToken(txn, jeff.id)
        val resp = Unirest.delete("$appUrl/mixtapes/$mixtapeId")
            .header("X-Auth-Token", authToken)
            .asString()

        assertEquals(204, resp.status)
        assertEquals(0, getPostCount())
        assertEquals(0, getMixtapeCount())
    }

    @Test
    fun `DELETE mixtapes_(id) - prevents deleting another user's mixtape`() {
        assertUnauthorizedMixtapeAccess { mixtapeId ->
            Unirest.delete("$appUrl/mixtapes/$mixtapeId")
        }
    }

    @Test
    fun `POST mixtapes_(id)_songs - adds a song to the mixtape`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val authToken = TestDataFactories.createAuthToken(txn, jeff.id)
        val mixtapeId = TestDataFactories.createMixtape(txn, jeff.id, false)
        val songId = TestDataFactories.createSong(txn)
        TestDataFactories.addSongToMixtape(txn, mixtapeId = mixtapeId, songId = songId, rank = 1)

        val track = TestDataFactories.createSpotifyTrack()

        val cacheEntry = SearchCacheEntry(
            spotify = track,
            isrc = "abcde",
            didHydrateExternalIds = true,
            appleMusicUrl = "12345",
            appleMusicId = "12345"
        )

        searchCacheDao.setSearchCacheEntry(track.id, cacheEntry)
        val resp = Unirest.post("$appUrl/mixtapes/$mixtapeId/songs")
            .header("X-Auth-Token", authToken)
            .body(JSONObject(mapOf("spotifyId" to track.id)))
            .asString()
        assertEquals(200, resp.status)

        val body = gson.fromJson(resp.body, SongWithMeta::class.java)
        assertEquals(track.id, body.spotifyId)

        val mixtapeResp = Unirest.get("$appUrl/mixtapes/$mixtapeId")
            .header("X-Auth-Token", authToken)
            .asString()
        assertEquals(200, mixtapeResp.status)
        val mixtapeBody = gson.fromJson(mixtapeResp.body, MixtapeWithSongsReponse::class.java)

        assertEquals(2, mixtapeBody.tracks.size)
        assertEquals(track.id, mixtapeBody.tracks[1].spotifyId)
    }

    @Test
    fun `POST mixtapes_(id)_songs - prevents posts to another user's mixtapes`() {
        assertUnauthorizedMixtapeAccess { mixtapeId ->
            Unirest.post("$appUrl/mixtapes/$mixtapeId/songs")
                .body(JSONObject(mapOf("spotifyId" to "asdf")))
        }
    }

    @Test
    fun `POST mixtapes_(id)_songs - prevents posts to an already-published mixtape`() {
        assertCannotUpdatePublishedMixtape { mixtapeId ->
            Unirest.post("$appUrl/mixtapes/$mixtapeId/songs")
                .body(JSONObject(mapOf("spotifyId" to "asdf")))
        }
    }

    @Test
    fun `POST mixtapes_(id)_songs - prevents adding the same song multiple times to a mixtape`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val mixtapeId = TestDataFactories.createMixtape(txn, jeff.id, false)
        val songId = TestDataFactories.createSong(txn, spotifyId = "someSongId")
        TestDataFactories.addSongToMixtape(txn, mixtapeId = mixtapeId, songId = songId, rank = 1)

        val authToken = TestDataFactories.createAuthToken(txn, jeff.id)
        val resp = Unirest.post("$appUrl/mixtapes/$mixtapeId/songs")
            .header("X-Auth-Token", authToken)
            .body(JSONObject(mapOf("spotifyId" to "someSongId")))
            .asString()
        assertEquals(400, resp.status)
    }

    @Test
    fun `DELETE mixtapes_(id)_songs_(id) - removes a song from a mixtape`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val mixtapeId = TestDataFactories.createMixtape(txn, jeff.id, false)
        val songId = TestDataFactories.createSong(txn, spotifyId = "someSongId")
        TestDataFactories.addSongToMixtape(txn, mixtapeId = mixtapeId, songId = songId, rank = 1)

        val authToken = TestDataFactories.createAuthToken(txn, jeff.id)
        val resp = Unirest.delete("$appUrl/mixtapes/$mixtapeId/songs/$songId")
            .header("X-Auth-Token", authToken)
            .asString()
        assertEquals(204, resp.status)

        val mixtapeResp = Unirest.get("$appUrl/mixtapes/$mixtapeId")
            .header("X-Auth-Token", authToken)
            .asString()
        assertEquals(200, mixtapeResp.status)
        val mixtapeBody = gson.fromJson(mixtapeResp.body, MixtapeWithSongsReponse::class.java)
        assertEquals(0, mixtapeBody.tracks.size)
    }

    @Test
    fun `DELETE mixtapes_(id)_songs_(id) - does not allow removing songs from another user's mixtape`() {
        assertUnauthorizedMixtapeAccess { mixtapeId ->
            val songId = TestDataFactories.createSong(txn, spotifyId = "someSongId")
            TestDataFactories.addSongToMixtape(txn, mixtapeId = mixtapeId, songId = songId, rank = 1)
            Unirest.delete("$appUrl/mixtapes/$mixtapeId/songs/$songId")
        }
    }

    @Test
    fun `DELETE mixtapes_(id)_songs_(id) - does not allow removing songs from published tapes`() {
        assertCannotUpdatePublishedMixtape { mixtapeId ->
            val songId = TestDataFactories.createSong(txn, spotifyId = "someSongId")
            TestDataFactories.addSongToMixtape(txn, mixtapeId = mixtapeId, songId = songId, rank = 1)
            Unirest.delete("$appUrl/mixtapes/$mixtapeId/songs/$songId")
        }
    }

    private fun assertCannotUpdatePublishedMixtape(cb: (mixtapeId: Int) -> HttpRequest<*>) {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val authToken = TestDataFactories.createAuthToken(txn, jeff.id)
        val mixtapeId = TestDataFactories.createMixtape(txn, jeff.id, true)

        val resp = cb(mixtapeId)
            .header("X-Auth-Token", authToken)
            .asString()
        assertEquals(400, resp.status)
    }

    private fun assertUnauthorizedMixtapeAccess(cb: (mixtapeId: Int) -> HttpRequest<*>) {
        val vinny = TestDataFactories.createUser(txn, "jeff", true)
        val mixtapeId = TestDataFactories.createMixtape(txn, vinny.id, false)
        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val authToken = TestDataFactories.createAuthToken(txn, jeff.id)

        val resp = cb(mixtapeId)
            .header("X-Auth-Token", authToken)
            .asString()
        assertEquals(401, resp.status)
    }
}
