import java.time.Instant

import com.google.gson.GsonBuilder
import com.typesafe.config.Config
import com.typesafe.config.ConfigFactory
import io.javalin.Javalin
import io.javalin.apibuilder.ApiBuilder.*
import io.javalin.core.validation.JavalinValidation
import io.javalin.plugin.json.FromJsonMapper
import io.javalin.plugin.json.JavalinJson
import io.javalin.plugin.json.ToJsonMapper
import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.kotlin.KotlinPlugin
import org.jdbi.v3.postgres.PostgresPlugin
import org.jdbi.v3.sqlobject.kotlin.KotlinSqlObjectPlugin
import org.jdbi.v3.sqlobject.kotlin.onDemand
import service.FeedService
import util.InstantTypeAdapter
import util.LocalDateTimeTypeAdapter
import web.AuthHandlers
import web.FeedRoutes

fun createJdbi(databaseUri: String): Jdbi {
    val jdbi = Jdbi.create(databaseUri)
    jdbi.installPlugin(KotlinPlugin())
    jdbi.installPlugin(KotlinSqlObjectPlugin())
    jdbi.installPlugin(PostgresPlugin())
    return jdbi
}

private fun configureJsonMapper() {
    val gson = GsonBuilder()
        .setPrettyPrinting()
        .setDateFormat("yyyy-MM-dd'T'HH:mmX")
        .registerTypeAdapter(Instant::class.java, InstantTypeAdapter())
        .registerTypeAdapter(LocalDateTimeTypeAdapter::class.java, LocalDateTimeTypeAdapter())
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
    val app = Javalin.create() { config ->
        config.defaultContentType = "application/json"
        config.showJavalinBanner = false  // would be fun to turn this back on for not tests
    }

    configureJsonMapper()
    configureValidation()

    // Wire up dependencies

    val jdbi = createJdbi(config.getString("databaseUrl"))

    // TODO: could these be hooked up to a shared transaction in some kind of "test mode"?
    val postDao = jdbi.onDemand<dao.PostDao>()
    val songDao = jdbi.onDemand<dao.SongDao>()
    val mixtapeDao = jdbi.onDemand<dao.MixtapeDao>()
    val userDao = jdbi.onDemand<dao.UserDao>()

    val authHandlers = AuthHandlers(userDao)

    val feedService = FeedService(postDao, songDao, mixtapeDao)
    val feedRoutes = FeedRoutes(feedService)

    app.routes {
        before(authHandlers::setUserFromHeader)

        get("/public-feed", feedRoutes::getPublicFeed)
        get("/feed", feedRoutes::getUserFeed)
    }

    return app
}

fun main() {
    val config = getConfig()
    val app = createApp(config)
    app.start(config.getInt("port"))
}

