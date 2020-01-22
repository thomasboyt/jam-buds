package service

import org.jdbi.v3.core.Handle
import java.time.Instant
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

class FeedServiceTest : BaseTest() {
    @Test
    fun `getPublicFeed - returns an empty list with no items`() {
        withTransaction { txn ->
            val feedService = createFeedService(txn)
            val results = feedService.getPublicFeed(beforeTimestamp = null, afterTimestamp = null)
            assertEquals(0, results.size)
        }
    }

    @Test
    fun `getPublicFeed - returns only public feed entries`() {
        withTransaction { txn ->
            val jeffId = createUser(txn, "jeff", true)
            val publicSongId = createSong(txn)
            createSongPost(txn, userId = jeffId, songId = publicSongId)

            val vinnyId = createUser(txn, "vinny", false)
            val privateSongId = createSong(txn)
            createSongPost(txn, userId = vinnyId, songId = privateSongId)

            val feedService = createFeedService(txn)
            val results = feedService.getPublicFeed(beforeTimestamp = null, afterTimestamp = null)
            assertEquals(1, results.size)
            assertEquals(publicSongId, results[0].song!!.id)
        }
    }

    @Test
    fun `getPublicFeed - allows pagination using a before timestamp`() {
        withTransaction { txn ->
            val jeffId = createUser(txn, "jeff", true)
            val songIds = (1..100).map {
                val songId = createSong(txn)
                createSongPost(txn, userId = jeffId, songId = songId)
                songId
            }
            val feedService = createFeedService(txn)

            val firstPage = feedService.getPublicFeed(beforeTimestamp = null, afterTimestamp = null)
            val expectedFirstPageIds = songIds.reversed().slice(0..19)
            assertEquals(expectedFirstPageIds, firstPage.map { it.song!!.id })

            val timestampCursor = firstPage.last().timestamp
            val secondPage = feedService.getPublicFeed(
                beforeTimestamp = timestampCursor,
                afterTimestamp = null
            )

            val expectedSecondPageIds = songIds.reversed().slice(20..39)
            assertEquals(expectedSecondPageIds, secondPage.map { it.song!!.id })
        }
    }

    @Test
    fun `getPublicFeed - does not apply a limit when using an after timestamp`() {
        withTransaction { txn ->
            val jeffId = createUser(txn, "jeff", true)
            val songIds = (1..100).map {
                val songId = createSong(txn)
                createSongPost(txn, userId = jeffId, songId = songId)
                songId
            }

            val feedService = createFeedService(txn)

            val allPosts = feedService.getPublicFeed(
                beforeTimestamp = null,
                afterTimestamp = null,
                limit = 100
            )
            val timestampCursor = allPosts.last().timestamp

            val newPosts = feedService.getPublicFeed(
                beforeTimestamp = null,
                afterTimestamp = timestampCursor,
                limit = 20
            )

            // remove the last item since it's the after cursor
            assertEquals(songIds.reversed().slice(0..98), newPosts.map { it.song!!.id })
        }
    }

    @Test
    fun `getPublicFeed - aggregates posts of the same song and sets timestamp to oldest post`() {
        withTransaction { txn ->
            val songId = createSong(txn)
            val jeffId = createUser(txn, "jeff", true)
            val firstTimestamp = createSongPost(txn, userId = jeffId, songId = songId)
            val vinnyId = createUser(txn, "vinny", true)
            createSongPost(txn, userId = vinnyId, songId = songId)

            val feedService = createFeedService(txn)
            val results = feedService.getPublicFeed(beforeTimestamp = null, afterTimestamp = null)
            assertEquals(1, results.size)
            assertEquals(songId, results[0].song!!.id)
            assertEquals(firstTimestamp, results[0].timestamp)
        }
    }

    private fun createSongPost(txn: Handle, userId: Int, songId: Int): Instant {
        return txn.createUpdate("""
                insert into posts (user_id, song_id) values (:userId, :songId)
                """.trimIndent())
            .bind("userId", userId)
            .bind("songId", songId)
            .executeAndReturnGeneratedKeys("created_at")
            .mapTo(Instant::class.java)
            .one()
    }

    private fun createSong(txn: Handle): Int {
        return txn.createUpdate("""
                insert into songs (title, artists) values (:title, :artist)
                """.trimIndent())
            .bind("title", "song")
            .bindArray("artist", String::class.java, listOf("song"))
            .executeAndReturnGeneratedKeys("id")
            .mapTo(Int::class.java)
            .one()
    }

    private fun createUser(txn: Handle, name: String, showInFeed: Boolean): Int {
        return txn.createUpdate("""
                insert into users (name, show_in_public_feed) values (:name, :show_in_public_feed)
                """.trimIndent())
            .bind("name", name)
            .bind("show_in_public_feed", showInFeed)
            .executeAndReturnGeneratedKeys("id")
            .mapTo(Int::class.java)
            .one()
    }

    private fun createFeedService(txn: Handle): FeedService {
        val postDao = txn.attach(dao.PostDao::class.java)
        val songDao = txn.attach(dao.SongDao::class.java)
        val mixtapeDao = txn.attach(dao.MixtapeDao::class.java)
        return FeedService(postDao, songDao, mixtapeDao)
    }
}
