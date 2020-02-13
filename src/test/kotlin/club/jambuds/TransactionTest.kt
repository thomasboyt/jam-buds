package club.jambuds

import org.flywaydb.core.Flyway
import org.jdbi.v3.core.Handle
import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.kotlin.useTransactionUnchecked
import org.junit.jupiter.api.BeforeAll

/**
 * Transactional tests provide a `withTransaction()` function that passes
 * a transaction that will be automatically rolled back to its callback.
 * Because of this, they do not reset DB state between tests.
 */
open class TransactionTest {
    companion object {
        private lateinit var jdbi: Jdbi
        private val config = getConfig()

        @BeforeAll
        @JvmStatic
        internal fun beforeAll() {
            val flyway = Flyway.configure()
                // note: if the dbUrl has a ?user=bob&password=secret param, it *should* take priority here
                .dataSource(config.getString("databaseUrl"), "postgres", "")
                .load()
            flyway.clean()
            flyway.migrate()
            jdbi = createJdbi(config.getString("databaseUrl"))
        }
    }

    internal fun withTransaction(cb: (txn: Handle) -> Unit) {
        jdbi.useTransactionUnchecked {
            cb(it)
            // if the test errors out, it will automatically execute a rollback; we only need a
            // manual rollback if we made it this far
            it.rollback()
        }
    }
}
