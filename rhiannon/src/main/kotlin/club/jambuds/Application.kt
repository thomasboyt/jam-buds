package club.jambuds

import club.jambuds.clients.DevEmailClient
import club.jambuds.clients.SendgridClient
import club.jambuds.clients.createButtondownClient
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
import club.jambuds.dao.cache.OAuthStateDao
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
import club.jambuds.service.SpotifyApiService
import club.jambuds.service.SpotifyAuthService
import club.jambuds.service.TwitterAuthService
import club.jambuds.service.TwitterService
import club.jambuds.service.UserService
import club.jambuds.util.InstantTypeAdapter
import club.jambuds.util.LocalDateTimeTypeAdapter
import club.jambuds.util.NewRelicPlugin
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
import club.jambuds.web.SpotifyAuthRoutes
import club.jambuds.web.TwitterAuthRoutes
import club.jambuds.web.UserRoutes
import com.google.gson.Gson
import com.google.gson.GsonBuilder
import com.typesafe.config.Config
import com.typesafe.config.ConfigFactory
import com.zaxxer.hikari.HikariDataSource
import io.javalin.Javalin
import io.javalin.core.validation.JavalinValidation
import io.javalin.plugin.json.FromJsonMapper
import io.javalin.plugin.json.JavalinJson
import io.javalin.plugin.json.ToJsonMapper
import io.lettuce.core.RedisClient
import io.sentry.Sentry
import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.kotlin.KotlinPlugin
import org.jdbi.v3.postgres.PostgresPlugin
import org.jdbi.v3.sqlobject.kotlin.KotlinSqlObjectPlugin
import org.jdbi.v3.sqlobject.kotlin.onDemand
import java.time.Instant

fun createJdbi(databaseUrl: String): Jdbi {
    val ds = HikariDataSource()
    ds.jdbcUrl = databaseUrl
    ds.maximumPoolSize = 3 // (core_size * 2) + disk_count

    val jdbi = Jdbi.create(ds)
    jdbi.installPlugin(KotlinPlugin())
    jdbi.installPlugin(KotlinSqlObjectPlugin())
    jdbi.installPlugin(PostgresPlugin())
    return jdbi
}

fun getGson(): Gson {
    return GsonBuilder()
        .setPrettyPrinting()
        .setDateFormat("yyyy-MM-dd'T'HH:mmX")
        .excludeFieldsWithoutExposeAnnotation()
        .registerTypeAdapter(
            Instant::class.java,
            InstantTypeAdapter()
        )
        .registerTypeAdapter(
            LocalDateTimeTypeAdapter::class.java,
            LocalDateTimeTypeAdapter()
        )
        .create()
}

private fun configureJsonMapper() {
    val gson = getGson()

    JavalinJson.fromJsonMapper = object : FromJsonMapper {
        override fun <T> map(json: String, targetClass: Class<T>) = gson.fromJson(json, targetClass)
    }

    JavalinJson.toJsonMapper = object : ToJsonMapper {
        override fun map(obj: Any): String = gson.toJson(obj)
    }
}

private fun configureValidation() {
    JavalinValidation.register(Instant::class.java) { Instant.parse(it) }
}

fun getConfig(): Config {
    val env = System.getenv("JAMBUDS_ENV") ?: throw Error("No JAMBUDS_ENV set!")
    val envConfig = ConfigFactory.parseResources("conf/$env.conf")
    val localConfig = ConfigFactory.parseResources("conf/local/$env.conf")
    val envVarConfig = ConfigFactory.parseResources("conf/vars.conf")
    return envVarConfig
        .withFallback(localConfig)
        .withFallback(envConfig)
        .resolve()
        .getConfig("rhiannon")
}

fun createJavalinApp(): Javalin {
    val app = Javalin.create { config ->
        config.defaultContentType = "application/json"
        config.showJavalinBanner = false // would be fun to turn this back on for not tests
        config.registerPlugin(NewRelicPlugin())
    }

    configureJsonMapper()
    configureValidation()

    return app
}

private fun wire(app: Javalin, config: Config) {
    val jdbi = createJdbi(config.getString("databaseUrl"))
    val redis = RedisClient.create(config.getString("redisUrl")).connect()

    // Spotify
    val spotifyApiService = SpotifyApiService(
        config.getString("spotifyClientId"),
        config.getString("spotifyClientSecret")
    )
    spotifyApiService.startRefreshLoop()

    // Apple Music
    val disableAppleMusic = config.getBoolean("disableAppleMusic")
    val appleMusicToken = if (disableAppleMusic) {
        "apple music disabled"
    } else {
        AppleMusicService.createAuthToken(
            privateKeyPath = config.getString("musickitPrivateKeyPath"),
            keyId = config.getString("musickitKeyId"),
            teamId = config.getString("musickitTeamId")
        )
    }
    val appleMusicService = AppleMusicService(appleMusicToken, disableAppleMusic)

    // Twitter
    val disableTwitter = config.getBoolean("disableTwitter")
    val twitterApiKey = if (disableTwitter) {
        "placeholder key"
    } else {
        config.getString("twitterApiKey")
    }
    val twitterApiSecret = if (disableTwitter) {
        "placeholder secret"
    } else {
        config.getString("twitterApiSecret")
    }
    val twitterService = TwitterService(twitterApiKey, twitterApiSecret, disableTwitter)

    // DAOs
    val postDao = jdbi.onDemand<PostDao>()
    val songDao = jdbi.onDemand<SongDao>()
    val mixtapeDao = jdbi.onDemand<MixtapeDao>()
    val userDao = jdbi.onDemand<UserDao>()
    val colorSchemeDao = jdbi.onDemand<ColorSchemeDao>()
    val likeDao = jdbi.onDemand<LikeDao>()
    val reportDao = jdbi.onDemand<ReportDao>()
    val notificationsDao = jdbi.onDemand<NotificationsDao>()
    val followingDao = jdbi.onDemand<FollowingDao>()
    val signInTokenDao = jdbi.onDemand<SignInTokenDao>()
    val authTokenDao = jdbi.onDemand<AuthTokenDao>()

    val searchCacheDao = SearchCacheDao(redis)
    val oAuthStateDao = OAuthStateDao(redis)
    val twitterFollowingCacheDao = TwitterFollowingCacheDao(redis)

    // Services
    val playlistService =
        PlaylistService(postDao, songDao, mixtapeDao, likeDao)
    val userService = UserService(
        userDao,
        colorSchemeDao,
        notificationsDao,
        twitterService,
        twitterFollowingCacheDao
    )
    val searchService = SearchService(
        spotifyApiService,
        appleMusicService,
        songDao,
        searchCacheDao,
        disableAppleMusic = disableAppleMusic
    )
    val mixtapeService = MixtapeService(mixtapeDao, songDao, userService, searchService)
    val postService =
        PostService(postDao, searchService, twitterService, config.getString("appUrl"))
    val likeService = LikeService(likeDao, songDao)
    val reportService = ReportService(reportDao, postDao)
    val spotifyAuthService = SpotifyAuthService(
        config.getString("appUrl"),
        oAuthStateDao,
        config.getString("spotifyClientId"),
        config.getString("spotifyClientSecret")
    )
    val followingService = FollowingService(followingDao, userDao, notificationsDao)
    val notificationService = NotificationService(notificationsDao, userDao)

    val disableEmail = config.getBoolean("disableEmail")
    val emailClient = if (disableEmail) {
        DevEmailClient()
    } else {
        SendgridClient(config.getString("sendgridApiKey"))
    }
    val emailService = EmailService(emailClient)

    val buttondownService = if (config.getBoolean("disableButtondown")) {
        ButtondownService(null)
    } else {
        val buttondownClient = createButtondownClient(config.getString("buttondownApiKey"))
        ButtondownService(buttondownClient)
    }

    val authService =
        AuthService(
            userDao,
            signInTokenDao,
            authTokenDao,
            followingService,
            emailService,
            buttondownService,
            appUrl = config.getString("appUrl"),
            skipAuth = config.getBoolean("dangerSkipAuth")
        )

    val twitterAuthService = TwitterAuthService(userDao, twitterApiKey, twitterApiSecret)

    // Routes
    app.routes {
        AuthHandlers(userDao).register()
        PlaylistRoutes(playlistService, userService).register()
        MixtapeRoutes(mixtapeService).register()
        SearchRoutes(searchService).register()
        PostRoutes(postService, reportService).register()
        LikeRoutes(likeService).register()
        SpotifyAuthRoutes(spotifyAuthService).register()
        UserRoutes(userService).register()
        FollowingRoutes(followingService).register()
        NotificationRoutes(notificationService).register()
        AuthRoutes(authService, config.getString("appUrl")).register()
        SettingsRoutes(buttondownService, userDao, colorSchemeDao).register()
        TwitterAuthRoutes(
            twitterAuthService,
            userDao,
            oAuthStateDao,
            config.getString("appUrl")
        ).register()
    }
}

fun main() {
    val dsn = System.getenv("RHIANNON_SENTRY_DSN")
    if (dsn != null) {
        Sentry.init(dsn)
    }

    val config = getConfig()
    val app = createJavalinApp()
    wire(app, config)
    app.start(config.getInt("port"))
}
