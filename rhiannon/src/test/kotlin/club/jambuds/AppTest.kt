package club.jambuds

import club.jambuds.clients.EmailClient
import club.jambuds.dao.AlbumDao
import club.jambuds.dao.AuthTokenDao
import club.jambuds.dao.ColorSchemeDao
import club.jambuds.dao.FollowingDao
import club.jambuds.dao.LikeDao
import club.jambuds.dao.MixtapeDao
import club.jambuds.dao.NotificationsDao
import club.jambuds.dao.PostDao
import club.jambuds.dao.ReportDao
import club.jambuds.dao.SignInTokenDao
import club.jambuds.dao.SongDao
import club.jambuds.dao.UserDao
import club.jambuds.dao.cache.SearchCacheDao
import club.jambuds.dao.cache.TwitterFollowingCacheDao
import club.jambuds.service.AppleMusicService
import club.jambuds.service.AuthService
import club.jambuds.service.ButtondownService
import club.jambuds.service.EmailService
import club.jambuds.service.FollowingService
import club.jambuds.service.LikeService
import club.jambuds.service.MixtapeService
import club.jambuds.service.NotificationService
import club.jambuds.service.PlaylistService
import club.jambuds.service.PostService
import club.jambuds.service.ReportService
import club.jambuds.service.SearchService
import club.jambuds.service.SongService
import club.jambuds.service.SpotifyApiService
import club.jambuds.service.TwitterService
import club.jambuds.service.UserService
import club.jambuds.web.AuthHandlers
import club.jambuds.web.AuthRoutes
import club.jambuds.web.FollowingRoutes
import club.jambuds.web.LikeRoutes
import club.jambuds.web.MixtapeRoutes
import club.jambuds.web.NotificationRoutes
import club.jambuds.web.PlaylistRoutes
import club.jambuds.web.PostRoutes
import club.jambuds.web.SearchRoutes
import club.jambuds.web.SettingsRoutes
import club.jambuds.web.SongRoutes
import club.jambuds.web.UserRoutes
import com.nhaarman.mockitokotlin2.mock
import io.javalin.Javalin
import io.lettuce.core.RedisClient
import kong.unirest.Unirest
import org.flywaydb.core.Flyway
import org.jdbi.v3.core.Handle
import org.jdbi.v3.core.kotlin.useTransactionUnchecked
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.extension.ExtendWith
import org.junit.jupiter.api.extension.ExtensionContext
import org.junit.jupiter.api.extension.Extensions
import org.junit.jupiter.api.extension.InvocationInterceptor
import org.junit.jupiter.api.extension.ReflectiveInvocationContext
import java.lang.reflect.Method
import kong.unirest.ObjectMapper

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
    val appUrl = "http://localhost:$testAppPort/api" // TODO: rename to apiUrl
    val authUrl = "http://localhost:$testAppPort/auth"

    lateinit var txn: Handle
    private lateinit var app: Javalin

    lateinit var mockSpotifyApiService: SpotifyApiService
    lateinit var mockAppleMusicService: AppleMusicService
    lateinit var mockTwitterService: TwitterService
    lateinit var mockEmailClient: EmailClient
    lateinit var mockButtondownService: ButtondownService

    lateinit var songDao: SongDao
    lateinit var userDao: UserDao
    lateinit var searchCacheDao: SearchCacheDao
    lateinit var followingService: FollowingService

    fun wire(txn: Handle) {
        this.txn = txn

        app = createJavalinApp(false)
        app.start(testAppPort)

        mockSpotifyApiService = mock()
        mockAppleMusicService = mock()
        mockTwitterService = mock()
        mockEmailClient = mock()
        mockButtondownService = mock()

        val postDao = txn.attach(PostDao::class.java)
        songDao = txn.attach(SongDao::class.java)
        val mixtapeDao = txn.attach(MixtapeDao::class.java)
        val albumDao = txn.attach(AlbumDao::class.java)
        userDao = txn.attach(UserDao::class.java)
        val colorSchemeDao = txn.attach(ColorSchemeDao::class.java)
        val likeDao = txn.attach(LikeDao::class.java)
        val reportDao = txn.attach(ReportDao::class.java)
        val notificationsDao = txn.attach(NotificationsDao::class.java)
        val followingDao = txn.attach(FollowingDao::class.java)
        val signInTokenDao = txn.attach(SignInTokenDao::class.java)
        val authTokenDao = txn.attach(AuthTokenDao::class.java)

        searchCacheDao = SearchCacheDao(redis)
        val twitterFollowingCacheDao = TwitterFollowingCacheDao(redis)

        val playlistService =
            PlaylistService(postDao, songDao, mixtapeDao, albumDao, likeDao)
        val userService = UserService(
            userDao,
            colorSchemeDao,
            notificationsDao,
            mockTwitterService,
            twitterFollowingCacheDao
        )
        val searchService = SearchService(
            mockSpotifyApiService,
            mockAppleMusicService,
            songDao,
            albumDao,
            searchCacheDao
        )
        val mixtapeService = MixtapeService(mixtapeDao, songDao, userService, searchService)
        val postService = PostService(
            postDao,
            searchService,
            mockTwitterService,
            config.getString("appUrl")
        )
        val likeService = LikeService(likeDao, songDao, mixtapeDao)
        val reportService = ReportService(reportDao, postDao)
        val notificationService = NotificationService(notificationsDao, userDao)
        followingService = FollowingService(followingDao, userDao, notificationsDao)
        val emailService = EmailService(mockEmailClient)
        val authService = AuthService(
            userDao,
            signInTokenDao,
            authTokenDao,
            followingService,
            emailService,
            mockButtondownService,
            appUrl = config.getString("appUrl"),
            skipAuth = false
        )
        val songService = SongService(songDao)

        app.routes {
            AuthHandlers(userDao).register()
            PlaylistRoutes(playlistService, userService).register()
            MixtapeRoutes(mixtapeService).register()
            SearchRoutes(searchService).register()
            PostRoutes(postService, reportService).register()
            LikeRoutes(likeService).register()
            UserRoutes(userService).register()
            NotificationRoutes(notificationService).register()
            FollowingRoutes(followingService).register()
            AuthRoutes(authService, appUrl = config.getString("appUrl")).register()
            SettingsRoutes(mockButtondownService, userDao, colorSchemeDao).register()
            SongRoutes(songService).register()
        }
    }

    @BeforeEach
    internal fun beforeEach() {
        Unirest.config().followRedirects(false)
    }

    @AfterEach
    internal fun afterEach() {
        app.stop()
        Unirest.shutDown()
    }

    companion object {
        val config = getConfig()
        val jdbi = createJdbi(config.getString("databaseUrl"))
        val redis = RedisClient.create(config.getString("redisUrl")).connect()
        val objectMapper = createObjectMapper()

        init {
            resetDatabase()
        }

        private fun resetDatabase() {
            val flyway = Flyway.configure()
                .dataSource(config.getString("databaseUrl"), "postgres", "")
                .load()
            flyway.clean()
            flyway.migrate()

            redis.sync().flushdb()
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
