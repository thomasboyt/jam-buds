package service

import org.jdbi.v3.core.Handle
import java.time.Instant
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals
import BaseTest

class FeedServiceTest : BaseTest() {
    @Test
    fun `getPublicFeed - returns an empty list with no items`() {
        withTransaction { txn ->
            val feedService = createFeedService(txn)
            val results = feedService.getPublicFeed(
                beforeTimestamp = null,
                afterTimestamp = null,
                currentUserId = null
            )
            assertEquals(0, results.items.size)
            assertEquals(20, results.limit)
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
            val results = feedService.getPublicFeed(
                beforeTimestamp = null,
                afterTimestamp = null,
                currentUserId = null
            )
            assertEquals(1, results.items.size)
            assertEquals(publicSongId, results.items[0].song!!.id)
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

            val firstPage = feedService.getPublicFeed(
                beforeTimestamp = null,
                afterTimestamp = null,
                currentUserId = null
            )
            val expectedFirstPageIds = songIds.reversed().slice(0..19)
            assertEquals(expectedFirstPageIds, firstPage.items.map { it.song!!.id })

            val timestampCursor = firstPage.items.last().timestamp
            val secondPage = feedService.getPublicFeed(
                beforeTimestamp = timestampCursor,
                afterTimestamp = null,
                currentUserId = null
            )

            val expectedSecondPageIds = songIds.reversed().slice(20..39)
            assertEquals(expectedSecondPageIds, secondPage.items.map { it.song!!.id })
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
                limit = 100,
                currentUserId = null
            )
            val timestampCursor = allPosts.items.last().timestamp

            val newPosts = feedService.getPublicFeed(
                beforeTimestamp = null,
                afterTimestamp = timestampCursor,
                limit = 20,
                currentUserId = null
            )

            // remove the last item since it's the after cursor
            assertEquals(songIds.reversed().slice(0..98), newPosts.items.map { it.song!!.id })
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
            val results = feedService.getPublicFeed(
                beforeTimestamp = null,
                afterTimestamp = null,
                currentUserId = null
            )
            assertEquals(1, results.items.size)
            assertEquals(songId, results.items[0].song!!.id)
            assertEquals(firstTimestamp, results.items[0].timestamp)
        }
    }

    @Test
    fun `getPublicFeed - sets isLiked to true for a user who has liked a song`() {
        withTransaction { txn ->
            val songId = createSong(txn)
            val jeffId = createUser(txn, "jeff", true)
            createSongPost(txn, userId = jeffId, songId = songId)

            val feedService = createFeedService(txn)
            val beforeLikeResults = feedService.getPublicFeed(
                currentUserId = jeffId,
                beforeTimestamp = null,
                afterTimestamp = null
            )
            assertEquals(false, beforeLikeResults.items[0].song!!.isLiked)

            createLike(txn, jeffId, songId)

            val afterLikeResults = feedService.getPublicFeed(
                currentUserId = jeffId,
                beforeTimestamp = null,
                afterTimestamp = null
            )
            assertEquals(true, afterLikeResults.items[0].song!!.isLiked)
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

    private fun createLike(txn: Handle, userId: Int, songId: Int): Int {
        return txn.createUpdate("""
                insert into likes (user_id, song_id) values (:userId, :songId)
                """.trimIndent())
            .bind("userId", userId)
            .bind("songId", songId)
            .execute()
    }

    private fun createFeedService(txn: Handle): FeedService {
        val postDao = txn.attach(dao.PostDao::class.java)
        val songDao = txn.attach(dao.SongDao::class.java)
        val mixtapeDao = txn.attach(dao.MixtapeDao::class.java)
        return FeedService(postDao, songDao, mixtapeDao)
    }
}
