package club.jambuds.service

import club.jambuds.BaseTest
import club.jambuds.dao.MixtapeDao
import club.jambuds.dao.PostDao
import club.jambuds.dao.SongDao
import helpers.TestDataFactories.createLike
import helpers.TestDataFactories.createSong
import helpers.TestDataFactories.createSongPost
import helpers.TestDataFactories.createUser
import helpers.TestDataFactories.followUser
import org.jdbi.v3.core.Handle
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

class PlaylistServiceTest : BaseTest() {
    @Test
    fun `getPublicFeed - returns an empty list with no items`() {
        withTransaction { txn ->
            val playlistService = createPlaylistService(txn)
            val results = playlistService.getPublicFeed(
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
            val playlistService = createPlaylistService(txn)

            val jeffId = createUser(txn, "jeff", true)
            val publicSongId = createSong(txn)
            createSongPost(txn, userId = jeffId, songId = publicSongId)

            val vinnyId = createUser(txn, "vinny", false)
            val privateSongId = createSong(txn)
            createSongPost(txn, userId = vinnyId, songId = privateSongId)

            val results = playlistService.getPublicFeed(
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
            val playlistService = createPlaylistService(txn)

            val jeffId = createUser(txn, "jeff", true)
            val songIds = (1..100).map {
                val songId = createSong(txn)
                createSongPost(txn, userId = jeffId, songId = songId)
                songId
            }

            val firstPage = playlistService.getPublicFeed(
                beforeTimestamp = null,
                afterTimestamp = null,
                currentUserId = null
            )
            val expectedFirstPageIds = songIds.reversed().slice(0..19)
            assertEquals(expectedFirstPageIds, firstPage.items.map { it.song!!.id })

            val timestampCursor = firstPage.items.last().timestamp
            val secondPage = playlistService.getPublicFeed(
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
            val playlistService = createPlaylistService(txn)

            val jeffId = createUser(txn, "jeff", true)
            val songIds = (1..100).map {
                val songId = createSong(txn)
                createSongPost(txn, userId = jeffId, songId = songId)
                songId
            }

            val allPosts = playlistService.getPublicFeed(
                beforeTimestamp = null,
                afterTimestamp = null,
                limit = 100,
                currentUserId = null
            )
            val timestampCursor = allPosts.items.last().timestamp

            val newPosts = playlistService.getPublicFeed(
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
            val playlistService = createPlaylistService(txn)

            val songId = createSong(txn)
            val jeffId = createUser(txn, "jeff", true)
            val firstPost = createSongPost(txn, userId = jeffId, songId = songId)
            val vinnyId = createUser(txn, "vinny", true)
            createSongPost(txn, userId = vinnyId, songId = songId)

            val results = playlistService.getPublicFeed(
                beforeTimestamp = null,
                afterTimestamp = null,
                currentUserId = null
            )
            assertEquals(1, results.items.size)
            assertEquals(songId, results.items[0].song!!.id)
            assertEquals(firstPost.createdAt, results.items[0].timestamp)
        }
    }

    @Test
    fun `getPublicFeed - sets isLiked to true for a user who has liked a song`() {
        withTransaction { txn ->
            val playlistService = createPlaylistService(txn)

            val songId = createSong(txn)
            val jeffId = createUser(txn, "jeff", true)
            createSongPost(txn, userId = jeffId, songId = songId)

            val beforeLikeResults = playlistService.getPublicFeed(
                currentUserId = jeffId,
                beforeTimestamp = null,
                afterTimestamp = null
            )
            assertEquals(false, beforeLikeResults.items[0].song!!.isLiked)

            createLike(txn, jeffId, songId)

            val afterLikeResults = playlistService.getPublicFeed(
                currentUserId = jeffId,
                beforeTimestamp = null,
                afterTimestamp = null
            )
            assertEquals(true, afterLikeResults.items[0].song!!.isLiked)
        }
    }

    @Test
    fun `getUserFeed - only includes posts from users the current user follows and their own`() {
        withTransaction { txn ->
            val playlistService = createPlaylistService(txn)

            val jeffId = createUser(txn, "jeff", true)
            val vinnyId = createUser(txn, "vinny", true)
            val bradId = createUser(txn, "brad", true)
            val benId = createUser(txn, "ben", true)

            followUser(txn, jeffId, vinnyId)
            followUser(txn, jeffId, bradId)

            createSongPost(txn, userId = jeffId, songId = createSong(txn))
            createSongPost(txn, userId = vinnyId, songId = createSong(txn))
            createSongPost(txn, userId = bradId, songId = createSong(txn))
            createSongPost(txn, userId = benId, songId = createSong(txn))

            val aggregatedPosts = playlistService.getUserFeed(
                currentUserId = jeffId,
                beforeTimestamp = null,
                afterTimestamp = null,
                limit = 10
            )

            assertEquals(3, aggregatedPosts.items.size)
            assertEquals(listOf("brad", "vinny", "jeff"), aggregatedPosts.items.map { it.userNames[0] })
        }
    }

    @Test
    fun `getUserFeed - aggregates entries by song`() {
        withTransaction { txn ->
            val playlistService = createPlaylistService(txn)

            val jeffId = createUser(txn, "jeff", true)
            val vinnyId = createUser(txn, "vinny", true)
            val bradId = createUser(txn, "brad", true)

            followUser(txn, jeffId, vinnyId)
            followUser(txn, jeffId, bradId)

            val sharedSongId = createSong(txn)
            createSongPost(txn, userId = jeffId, songId = sharedSongId)
            createSongPost(txn, userId = vinnyId, songId = sharedSongId)
            createSongPost(txn, userId = bradId, songId = sharedSongId)
            createSongPost(txn, userId = vinnyId, songId = createSong(txn))

            val aggregatedPosts = playlistService.getUserFeed(
                currentUserId = jeffId,
                beforeTimestamp = null,
                afterTimestamp = null,
                limit = 10
            )

            assertEquals(2, aggregatedPosts.items.size)
            assertEquals(listOf("jeff", "vinny", "brad"), aggregatedPosts.items[1].userNames)
        }
    }

    @Test
    fun `getUserFeed - aggregated timestamp logic`() {
        withTransaction { txn ->
            val playlistService = createPlaylistService(txn)

            val jeffId = createUser(txn, "jeff", true)
            val vinnyId = createUser(txn, "vinny", true)
            val bradId = createUser(txn, "brad", true)
            val benId = createUser(txn, "ben", true)

            followUser(txn, jeffId, vinnyId)
            followUser(txn, jeffId, bradId)
            followUser(txn, jeffId, benId)

            val sharedSongId = createSong(txn)

            // with only posts from other users: the oldest time is used
            val vinnyPost = createSongPost(txn, userId = vinnyId, songId = sharedSongId)
            val bradPost = createSongPost(txn, userId = bradId, songId = sharedSongId)

            var aggregatedPosts = playlistService.getUserFeed(
                currentUserId = jeffId,
                beforeTimestamp = null,
                afterTimestamp = null,
                limit = 10
            )

            assertEquals(1, aggregatedPosts.items.size)
            assertEquals(aggregatedPosts.items[0].timestamp, vinnyPost.createdAt)

            // with newest post from current user: the current user's time is used
            val jeffPost = createSongPost(txn, userId = jeffId, songId = sharedSongId)

            aggregatedPosts = playlistService.getUserFeed(
                currentUserId = jeffId,
                beforeTimestamp = null,
                afterTimestamp = null,
                limit = 10
            )

            assertEquals(1, aggregatedPosts.items.size)
            assertEquals(aggregatedPosts.items[0].timestamp, jeffPost.createdAt)

            // with newest post from another user, but with a post from current user: the current user's time is used
            val benPost = createSongPost(txn, userId = benId, songId = sharedSongId)

            aggregatedPosts = playlistService.getUserFeed(
                currentUserId = jeffId,
                beforeTimestamp = null,
                afterTimestamp = null,
                limit = 10
            )

            assertEquals(1, aggregatedPosts.items.size)
            assertEquals(aggregatedPosts.items[0].timestamp, jeffPost.createdAt)
        }
    }

    @Test
    @Disabled
    fun `getUserFeed - pagination logic`() {
        // TODO: Test: correctly paginates with cursors including current user aggregated timestamps
    }

    private fun createPlaylistService(txn: Handle): PlaylistService {
        val postDao = txn.attach(PostDao::class.java)
        val songDao = txn.attach(SongDao::class.java)
        val mixtapeDao = txn.attach(MixtapeDao::class.java)
        return PlaylistService(postDao, songDao, mixtapeDao)
    }
}
