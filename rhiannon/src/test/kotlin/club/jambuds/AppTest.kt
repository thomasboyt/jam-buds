package club.jambuds

import club.jambuds.dao.ColorSchemeDao
import club.jambuds.dao.LikeDao
import club.jambuds.dao.MixtapeDao
import club.jambuds.dao.PostDao
import club.jambuds.dao.SongDao
import club.jambuds.dao.UserDao
import club.jambuds.service.MixtapeService
import club.jambuds.service.PlaylistService
import club.jambuds.service.SearchService
import club.jambuds.service.SpotifyApiService
import club.jambuds.service.UserService
import club.jambuds.web.AuthHandlers
import club.jambuds.web.MixtapeRoutes
import club.jambuds.web.PlaylistRoutes
import club.jambuds.web.SearchRoutes
import com.nhaarman.mockitokotlin2.mock
import io.javalin.Javalin
import kong.unirest.Unirest
import org.flywaydb.core.Flyway
import org.jdbi.v3.core.Handle
import org.jdbi.v3.core.kotlin.useTransactionUnchecked
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.extension.ExtendWith
import org.junit.jupiter.api.extension.ExtensionContext
import org.junit.jupiter.api.extension.Extensions
import org.junit.jupiter.api.extension.InvocationInterceptor
import org.junit.jupiter.api.extension.ReflectiveInvocationContext
import java.lang.reflect.Method

/**
 * AppTest starts an actual instance of the server. It wires up DAOs, services,
 * route handlers, and other dependencies just like Application#wire, except it
 * attaches DAOs to a rollback-able transaction and can subsitute mocks for
 * external services.
 */
@Extensions(
    ExtendWith(TransactionIterceptor::class)
)
open class AppTest {
    private val testAppPort = 7001 // TODO: allow configuration?
    val appUrl = "http://localhost:$testAppPort/api"

    lateinit var txn: Handle
    private lateinit var app: Javalin
    lateinit var mockSpotifyApiService: SpotifyApiService

    fun wire(txn: Handle) {
        this.txn = txn

        app = createJavalinApp()
        app.start(testAppPort)

        val postDao = txn.attach(PostDao::class.java)
        val songDao = txn.attach(SongDao::class.java)
        val mixtapeDao = txn.attach(MixtapeDao::class.java)
        val userDao = txn.attach(UserDao::class.java)
        val colorSchemeDao = txn.attach(ColorSchemeDao::class.java)
        val likeDao = txn.attach(LikeDao::class.java)

        val playlistService =
            PlaylistService(postDao, songDao, mixtapeDao, likeDao)
        val userService = UserService(userDao, colorSchemeDao)
        val mixtapeService = MixtapeService(mixtapeDao, songDao, userService)

        mockSpotifyApiService = mock()
        val searchService = SearchService(mockSpotifyApiService)

        app.routes {
            AuthHandlers(userDao).register()
            PlaylistRoutes(playlistService, userService).register()
            MixtapeRoutes(mixtapeService).register()
            SearchRoutes(searchService).register()
        }
    }

    @AfterEach
    internal fun afterEach() {
        app.stop()
        Unirest.shutDown()
    }

    companion object {
        val config = getConfig()
        val jdbi = createJdbi(config.getString("databaseUrl"))

        init {
            resetDatabase()
        }

        private fun resetDatabase() {
            val flyway = Flyway.configure()
                .dataSource(config.getString("databaseUrl"), "postgres", "")
                .load()
            flyway.clean()
            flyway.migrate()
        }
    }
}

class TransactionIterceptor : InvocationInterceptor {
    override fun interceptTestMethod(
        invocation: InvocationInterceptor.Invocation<Void>,
        invocationContext: ReflectiveInvocationContext<Method>,
        extensionContext: ExtensionContext
    ) {
        AppTest.jdbi.useTransactionUnchecked { txn ->
            val testCase = invocationContext.target.get() as AppTest
            testCase.wire(txn)
            invocation.proceed()
            txn.rollback()
        }
    }
}
