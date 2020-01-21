package service

import org.flywaydb.core.Flyway
import org.jdbi.v3.sqlobject.kotlin.onDemand
import org.jdbi.v3.core.Jdbi
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.BeforeEach
import kotlin.test.assertEquals
import createJdbi

class FeedServiceTest {
    private lateinit var jdbi: Jdbi

    @BeforeEach()
    fun beforeEach() {
        // TODO: would be nice to create the DB if it doesn't exist here....
        val flyway = Flyway.configure()
            .dataSource("jdbc:postgresql://localhost:5433/jambuds_kotlin_test", "postgres", "")
            .load()
        flyway.clean()
        flyway.migrate()
        jdbi = createJdbi("jdbc:postgresql://localhost:5433/jambuds_kotlin_test?user=postgres")
    }

    @Test
    fun `getPublicFeed - returns an empty list with no items`() {
        val feedService = createFeedService()
        val results = feedService.getPublicFeed(beforeTimestamp = null, afterTimestamp = null)
        assertEquals(0, results.size)
    }

//    @Test
//    fun `getPublicFeed - allows pagination using a before timestamp`() {
//    }
//
//    @Test
//    fun `getPublicFeed - does not apply a limit when using an after timestamp`() {
//    }

    private fun createFeedService(): FeedService {
        val postDao = jdbi.onDemand<dao.PostDao>()
        val songDao = jdbi.onDemand<dao.SongDao>()
        val mixtapeDao = jdbi.onDemand<dao.MixtapeDao>()
        return FeedService(postDao, songDao, mixtapeDao)
    }
}
