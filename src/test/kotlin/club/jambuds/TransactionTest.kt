package club.jambuds

import org.flywaydb.core.Flyway
import org.jdbi.v3.core.Handle
import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.kotlin.useTransactionUnchecked
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.BeforeEach

open class TransactionTest {
    private lateinit var jdbi: Jdbi

    companion object {
        val config = getConfig()

        @BeforeAll
        @JvmStatic
        internal fun beforeAll() {
            val flyway = Flyway.configure()
                // note: if the dbUrl has a ?user=bob&password=secret param, it *should* take priority here
                .dataSource(config.getString("databaseUrl"), "postgres", "")
                .load()
            flyway.clean()
            flyway.migrate()
        }
    }

    @BeforeEach
    fun beforeEach() {
        jdbi = createJdbi(config.getString("databaseUrl"))
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
