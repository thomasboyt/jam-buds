package club.jambuds.web

import club.jambuds.AppTest
import club.jambuds.helpers.TestDataFactories
import kong.unirest.Unirest
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue
import org.junit.jupiter.api.Test

class SongRoutesTest: AppTest() {
    @Test
    fun `PUT songs_(songId)_listened - creates a listened entry for a song`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val authToken = TestDataFactories.createAuthToken(txn, jeff.id)
        val songId = TestDataFactories.createSong(txn)

        val resp = Unirest.put("$appUrl/songs/$songId/listened")
            .header("X-Auth-Token", authToken)
            .asString()
        assertEquals(204, resp.status)

        assertTrue(songDao.hasSongListenedEntry(userId = jeff.id, songId = songId))
    }

    @Test
    fun `PUT songs_(songId)_listened - 404s for nonexistent song`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val authToken = TestDataFactories.createAuthToken(txn, jeff.id)

        val resp = Unirest.put("$appUrl/songs/1234/listened")
            .header("X-Auth-Token", authToken)
            .asString()
        assertEquals(404, resp.status)
    }

    @Test
    fun `DELETE songs_(songId)_listened - removes a listened entry for a song`() {
        val jeff = TestDataFactories.createUser(txn, "jeff", true)
        val authToken = TestDataFactories.createAuthToken(txn, jeff.id)
        val songId = TestDataFactories.createSong(txn)

        // call twice to ensure it's idemopotent
        Unirest.put("$appUrl/songs/$songId/listened")
            .header("X-Auth-Token", authToken)
            .asString()
        Unirest.put("$appUrl/songs/$songId/listened")
            .header("X-Auth-Token", authToken)
            .asString()

        assertTrue(songDao.hasSongListenedEntry(userId = jeff.id, songId = songId))

        val resp = Unirest.delete("$appUrl/songs/$songId/listened")
            .header("X-Auth-Token", authToken)
            .asString()
        assertEquals(204, resp.status)

        assertFalse(songDao.hasSongListenedEntry(userId = jeff.id, songId = songId))
    }
}
