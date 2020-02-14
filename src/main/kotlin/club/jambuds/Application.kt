package club.jambuds

import club.jambuds.dao.ColorSchemeDao
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

fun createJavalinApp(): Javalin {
    val app = Javalin.create { config ->
        config.defaultContentType = "application/json"
        config.showJavalinBanner = false // would be fun to turn this back on for not tests
    }

    configureJsonMapper()
    configureValidation()

    return app
}

private fun wire(app: Javalin, jdbi: Jdbi) {
    val postDao = jdbi.onDemand<PostDao>()
    val songDao = jdbi.onDemand<SongDao>()
    val mixtapeDao = jdbi.onDemand<MixtapeDao>()
    val userDao = jdbi.onDemand<UserDao>()
    val colorSchemeDao = jdbi.onDemand<ColorSchemeDao>()

    val playlistService =
        PlaylistService(postDao, songDao, mixtapeDao)
    val userService = UserService(userDao, colorSchemeDao)

    val authHandlers = AuthHandlers(userDao)
    val playlistRoutes = PlaylistRoutes(playlistService, userService)

    app.routes {
        authHandlers.register()
        playlistRoutes.register()
    }
}

fun main() {
    val config = getConfig()
    val jdbi = createJdbi(config.getString("databaseUrl"))
    val app = createJavalinApp()
    wire(app, jdbi)
    app.start(config.getInt("port"))
}
