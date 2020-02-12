package club.jambuds

import club.jambuds.dao.MixtapeDao
import club.jambuds.dao.PostDao
import club.jambuds.dao.SongDao
import club.jambuds.dao.UserDao
import club.jambuds.service.PlaylistService
import club.jambuds.service.UserService
import club.jambuds.util.InstantTypeAdapter
import club.jambuds.util.LocalDateTimeTypeAdapter
import club.jambuds.web.AuthHandlers
import club.jambuds.web.PlaylistRoutes
import com.google.gson.GsonBuilder
import com.typesafe.config.Config
import com.typesafe.config.ConfigFactory
import com.zaxxer.hikari.HikariDataSource
import io.javalin.Javalin
import io.javalin.apibuilder.ApiBuilder.before
import io.javalin.apibuilder.ApiBuilder.get
import io.javalin.core.validation.JavalinValidation
import io.javalin.plugin.json.FromJsonMapper
import io.javalin.plugin.json.JavalinJson
import io.javalin.plugin.json.ToJsonMapper
import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.kotlin.KotlinPlugin
import org.jdbi.v3.postgres.PostgresPlugin
import org.jdbi.v3.sqlobject.kotlin.KotlinSqlObjectPlugin
import org.jdbi.v3.sqlobject.kotlin.onDemand
import java.time.Instant

fun createJdbi(databaseUri: String): Jdbi {
    val ds = HikariDataSource()
    ds.jdbcUrl = databaseUri
    ds.maximumPoolSize = 3  // (core_size * 2) + disk_count

    val jdbi = Jdbi.create(ds)
    jdbi.installPlugin(KotlinPlugin())
    jdbi.installPlugin(KotlinSqlObjectPlugin())
    jdbi.installPlugin(PostgresPlugin())
    return jdbi
}

private fun configureJsonMapper() {
    val gson = GsonBuilder()
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
    val envVarConfig = ConfigFactory.parseResources("conf/vars.conf")
    return envVarConfig
        .withFallback(envConfig)
        .resolve()
        .getConfig("rhiannon")
}

fun createApp(config: Config): Javalin {
    val app = Javalin.create { config ->
        config.defaultContentType = "application/json"
        config.showJavalinBanner = false // would be fun to turn this back on for not tests
    }

    configureJsonMapper()
    configureValidation()

    // Wire up dependencies

    val jdbi = createJdbi(config.getString("databaseUrl"))

    // TODO: could these be hooked up to a shared transaction in some kind of "test mode"?
    val postDao = jdbi.onDemand<PostDao>()
    val songDao = jdbi.onDemand<SongDao>()
    val mixtapeDao = jdbi.onDemand<MixtapeDao>()
    val userDao = jdbi.onDemand<UserDao>()

    val authHandlers = AuthHandlers(userDao)

    val playlistService =
        PlaylistService(postDao, songDao, mixtapeDao)
    val userService = UserService(userDao)
    val playlistRoutes = PlaylistRoutes(playlistService, userService)

    app.routes {
        before(authHandlers::setUserFromHeader)

        get("/api/public-feed", playlistRoutes::getPublicFeed)
        get("/api/feed", playlistRoutes::getUserFeed)
        get("/api/playlists/:userName", playlistRoutes::getUserPlaylist)
    }

    return app
}

fun main() {
    val config = getConfig()
    val app = createApp(config)
    app.start(config.getInt("port"))
}
