package service

import org.flywaydb.core.Flyway
import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.Handle
import org.jdbi.v3.core.kotlin.useTransactionUnchecked
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.BeforeEach
import kotlin.test.assertEquals
import createJdbi

class FeedServiceTest {
    private lateinit var jdbi: Jdbi

    @BeforeEach
    fun beforeEach() {
        val flyway = Flyway.configure()
            .dataSource("jdbc:postgresql://localhost:5433/jambuds_kotlin_test", "postgres", "")
            .load()

        // TODO: figure out how to only clean if first test run here
        flyway.clean()

        flyway.migrate()
        jdbi = createJdbi("jdbc:postgresql://localhost:5433/jambuds_kotlin_test?user=postgres")
    }

    @Test
    fun `getPublicFeed - returns an empty list with no items`() {
        withTransaction { txn ->
            val feedService = createFeedService(txn)
            val results = feedService.getPublicFeed(beforeTimestamp = null, afterTimestamp = null)
            assertEquals(0, results.size)
        }
    }

    @Test
    fun `getPublicFeed - returns public feed entries`() {
        withTransaction { txn ->
            val feedService = createFeedService(txn)

            txn.createUpdate("""
                insert into users (name, show_in_public_feed) values (:name, :show_in_public_feed)
                """.trimIndent())
                .bind("name", "thomas")
                .bind("show_in_public_feed", true)
                .execute()

            val results = feedService.getPublicFeed(beforeTimestamp = null, afterTimestamp = null)
            assertEquals(3, results.size)
        }
    }

//    @Test
//    fun `getPublicFeed - allows pagination using a before timestamp`() {
//    }
//
//    @Test
//    fun `getPublicFeed - does not apply a limit when using an after timestamp`() {
//    }

    private fun withTransaction(cb: (txn: Handle) -> Unit) {
        jdbi.useTransactionUnchecked {
            cb(it)
            // if the test errors out, it will automatically execute a rollback; we only need a
            // manual rollback if we made it this far
            it.rollback()
        }
    }

    private fun createFeedService(txn: Handle): FeedService {
        val postDao = txn.attach(dao.PostDao::class.java)
        val songDao = txn.attach(dao.SongDao::class.java)
        val mixtapeDao = txn.attach(dao.MixtapeDao::class.java)
        return FeedService(postDao, songDao, mixtapeDao)
    }
}
