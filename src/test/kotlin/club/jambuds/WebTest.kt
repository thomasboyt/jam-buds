package club.jambuds

import club.jambuds.TransactionTest.Companion.config
import io.javalin.Javalin
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach

// TODO: allow configuration?
const val TEST_APP_PORT = 7001

open class WebTest {
    val appUrl = "http://localhost:$TEST_APP_PORT/api"
    lateinit var app: Javalin

    @BeforeEach
    fun beforeEach() {
        app = createApp(config)
        app.start(TEST_APP_PORT)
    }

    @AfterEach
    fun afterEach() {
        app.stop()
    }
}
