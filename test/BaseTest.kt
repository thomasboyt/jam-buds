import org.flywaydb.core.Flyway
import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.Handle
import org.jdbi.v3.core.kotlin.useTransactionUnchecked
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.BeforeAll

private fun getDatabaseUrl(): String {
    return System.getenv("JDBC_DATABASE_URL") ?: "jdbc:postgresql://localhost:5433/jambuds_kotlin_test?user=postgres"
}

// TODO: allow configuration?
const val TEST_APP_PORT = 7001

open class BaseTest {
    private lateinit var jdbi: Jdbi
    val appUrl = "http://localhost:$TEST_APP_PORT"

    companion object {
        @BeforeAll
        @JvmStatic
        internal fun beforeAll() {
            val flyway = Flyway.configure()
                // note: if the dbUrl has a ?user=bob&password=secret param, it *should* take priority here
                .dataSource(getDatabaseUrl(), "postgres", "")
                .load()
            flyway.clean()
            flyway.migrate()
        }
    }

    @BeforeEach
    fun beforeEach() {
        jdbi = createJdbi(getDatabaseUrl())
    }

    internal fun withTransaction(cb: (txn: Handle) -> Unit) {
        jdbi.useTransactionUnchecked {
            cb(it)
            // if the test errors out, it will automatically execute a rollback; we only need a
            // manual rollback if we made it this far
            it.rollback()
        }
    }

    internal fun withTestApp(cb: () -> Unit) {
        val app = createApp(getDatabaseUrl())
        app.start(TEST_APP_PORT)
        try {
            cb()
        } finally {
            app.stop()
        }
    }
}
