package club.jambuds.web

import club.jambuds.AppTest
import club.jambuds.getGson
import club.jambuds.helpers.TestDataFactories
import club.jambuds.responses.MixtapeWithSongsReponse
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
}
