package club.jambuds

import club.jambuds.clients.DevEmailClient
import club.jambuds.clients.SendgridClient
import club.jambuds.clients.createButtondownClient
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
import club.jambuds.dao.cache.OAuthStateDao
import club.jambuds.dao.cache.SearchCacheDao
import club.jambuds.dao.cache.TwitterFollowingCacheDao
import club.jambuds.model.ItemSource
import club.jambuds.service.AppleMusicService
import club.jambuds.service.AuthService
import club.jambuds.service.BandcampService
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
import club.jambuds.service.SpotifyAuthService
import club.jambuds.service.TwitterAuthService
import club.jambuds.service.TwitterService
import club.jambuds.service.UserService
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
import club.jambuds.web.SongRoutes
import club.jambuds.web.SpotifyAuthRoutes
import club.jambuds.web.TwitterAuthRoutes
import club.jambuds.web.UserRoutes
import com.fasterxml.jackson.databind.DeserializationFeature
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.kotlin.KotlinModule
import com.typesafe.config.Config
import com.typesafe.config.ConfigException
import com.typesafe.config.ConfigFactory
import com.zaxxer.hikari.HikariDataSource
import io.javalin.Javalin
import io.javalin.core.validation.JavalinValidation
import io.javalin.http.HttpResponseExceptionMapper
import io.javalin.http.InternalServerErrorResponse
import io.javalin.plugin.json.JavalinJackson
import io.javalin.plugin.openapi.OpenApiOptions
import io.javalin.plugin.openapi.OpenApiPlugin
import io.javalin.plugin.openapi.ui.SwaggerOptions
import io.lettuce.core.RedisClient
import io.sentry.Sentry
import io.swagger.v3.oas.models.Components
import io.swagger.v3.oas.models.OpenAPI
import io.swagger.v3.oas.models.info.Info
import io.swagger.v3.oas.models.security.SecurityRequirement
import io.swagger.v3.oas.models.security.SecurityScheme
import java.nio.file.Files
import java.nio.file.Paths
import java.text.SimpleDateFormat
import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.kotlin.KotlinPlugin
import org.jdbi.v3.postgres.PostgresPlugin
import org.jdbi.v3.sqlobject.kotlin.KotlinSqlObjectPlugin
import org.jdbi.v3.sqlobject.kotlin.onDemand
import java.time.Instant

class Application {
    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            val dsn = System.getenv("RHIANNON_SENTRY_DSN")
            if (dsn != null) {
                Sentry.init(dsn)
            }

            val config = getConfig()
            val app = createJavalinApp(config.getBoolean("hostDocs"))
            wire(app, config)
            app.start(config.getInt("port"))
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

        fun createJavalinApp(generateOpenApi: Boolean): Javalin {
            val app = Javalin.create { config ->
                config.defaultContentType = "application/json"
                config.showJavalinBanner = false // would be fun to turn this back on for not tests
                config.registerPlugin(NewRelicPlugin())
                if (generateOpenApi) {
                    config.registerPlugin(createOpenApiPlugin())
                }
            }

            JavalinJackson.configure(createObjectMapper())
            configureValidation()

            app.exception(Exception::class.java) { e, ctx ->
                Javalin.log.error("Uncaught exception", e)
                HttpResponseExceptionMapper.handle(InternalServerErrorResponse(), ctx)
            }

            return app
        }

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

        fun createObjectMapper(): ObjectMapper {
            val df = SimpleDateFormat("yyyy-MM-dd'T'HH:mmX")
            return ObjectMapper()
                .registerModule(KotlinModule())
                .registerModule(JavaTimeModule())
                .setDateFormat(df)
                .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
        }

        private fun configureValidation() {
            JavalinValidation.register(Instant::class.java) { Instant.parse(it) }
            JavalinValidation.register(ItemSource::class.java) { ItemSource.valueOf(it.toUpperCase()) }
        }

        private fun createOpenApiPlugin(): OpenApiPlugin {
            val scheme = SecurityScheme().apply {
                type = SecurityScheme.Type.APIKEY
                `in` = SecurityScheme.In.HEADER
                name = "X-Auth-Token"
            }
            val opts = OpenApiOptions {
                OpenAPI()
                    .components(Components().apply {
                        addSecuritySchemes("token", scheme)
                    })
                    .security(listOf(SecurityRequirement().addList("token")))
                    .info(Info().apply {
                        version("1.0")
                        title("Jam Buds API")
                        description("Jam Buds API")
                    })
            }.apply {
                path("/swagger-docs")
                swagger(SwaggerOptions("/swagger-ui"))
            }
            return OpenApiPlugin(opts)
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
                val key = try {
                    config.getString("musickitPrivateKey")
                } catch (e: ConfigException.Missing) {
                    val path = config.getString("musickitPrivateKeyPath")
                    String(Files.readAllBytes(Paths.get(path)))
                }
                AppleMusicService.createAuthToken(
                    key = key,
                    keyId = config.getString("musickitKeyId"),
                    teamId = config.getString("musickitTeamId")
                )
            }
            val appleMusicService = AppleMusicService(appleMusicToken, disableAppleMusic)

            val bandcampService = BandcampService()

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
            val albumDao = jdbi.onDemand<AlbumDao>()
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
                PlaylistService(postDao, songDao, mixtapeDao, albumDao, likeDao)
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
                bandcampService,
                songDao,
                albumDao,
                searchCacheDao,
                disableAppleMusic = disableAppleMusic
            )
            val mixtapeService = MixtapeService(mixtapeDao, songDao, userService, searchService)
            val postService =
                PostService(postDao, searchService, twitterService, config.getString("appUrl"))
            val likeService = LikeService(likeDao, songDao, mixtapeDao)
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

            val songService = SongService(songDao)

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
                SongRoutes(songService).register()
            }
        }
    }
}
