package dao

import org.jdbi.v3.core.Handle
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals
import helpers.TestDataFactories.createSong
import helpers.TestDataFactories.createSongPost
import helpers.TestDataFactories.createUser
import helpers.TestDataFactories.followUser
import BaseTest

class PostDaoTest : BaseTest() {
    @Test
    fun `getAggregatedPostsByUserFeed - only includes posts from users the current user follows and their own`() {
        withTransaction { txn ->
            val postDao = createPostDao(txn)

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

            val aggregatedPosts = postDao.getAggregatedPostsByUserFeed(
                currentUserId = jeffId,
                beforeTimestamp = null,
                afterTimestamp = null,
                limit = 10
            )

            assertEquals(3, aggregatedPosts.size)
            assertEquals(listOf("brad", "vinny", "jeff"), aggregatedPosts.map { it.userNames[0] })
        }
    }

    @Test
    fun `getAggregatedPostsByUserFeed - aggregates entries by song`() {
        withTransaction { txn ->
            val postDao = createPostDao(txn)

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

            val aggregatedPosts = postDao.getAggregatedPostsByUserFeed(
                currentUserId = jeffId,
                beforeTimestamp = null,
                afterTimestamp = null,
                limit = 10
            )

            assertEquals(2, aggregatedPosts.size)
            assertEquals(listOf("jeff", "vinny", "brad"), aggregatedPosts[1].userNames)
        }
    }

    // TODO: Test: uses most recent post time OR time current user posted song as timestamp

    // TODO: Test: correctly paginates with cursors including current user aggregated timestamps

    private fun createPostDao(txn: Handle): dao.PostDao {
        return txn.attach(dao.PostDao::class.java)
    }
}
