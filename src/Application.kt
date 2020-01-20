import io.ktor.application.*
import io.ktor.features.*
import io.ktor.gson.gson
import io.ktor.response.*
import io.ktor.http.*
import io.ktor.routing.*
import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.kotlin.KotlinPlugin
import org.jdbi.v3.postgres.PostgresPlugin
import org.jdbi.v3.sqlobject.kotlin.KotlinSqlObjectPlugin
import org.jdbi.v3.sqlobject.kotlin.onDemand

import dao.PostDao
import service.FeedService
import util.registerInstantTypeAdapter
import util.registerLocalDateTimeAdapter
import web.feed

fun main(args: Array<String>): Unit = io.ktor.server.netty.EngineMain.main(args)

fun createJdbi(databaseUri: String): Jdbi {
    val jdbi = Jdbi.create(databaseUri)
    jdbi.installPlugin(KotlinPlugin())
    jdbi.installPlugin(KotlinSqlObjectPlugin())
    jdbi.installPlugin(PostgresPlugin())
    return jdbi
}

@Suppress("unused") // Referenced in application.conf
@kotlin.jvm.JvmOverloads
fun Application.module(testing: Boolean = false) {
    install(DefaultHeaders)
    install(CallLogging)
    install(ConditionalHeaders)
    install(ContentNegotiation) {
        gson {
            setPrettyPrinting()
            setDateFormat("yyyy-MM-dd'T'HH:mmX")
            registerInstantTypeAdapter(this)
            registerLocalDateTimeAdapter(this)
        }
    }
    install(StatusPages) {
        exception<Throwable> { cause ->
            environment.log.error("Error", cause)

            // TODO: in production, set message to "Internal server error"
            val errorResource = JamBudsErrorResource(
                code = HttpStatusCode.InternalServerError,
                request = call.request.local.uri,
                message = cause.toString(),
                cause = cause
            )
            call.respond(errorResource)
        }
    }

    // TODO: I guess this should just become dependency injection at some point?
    val jdbi = createJdbi(environment.config.property("jambuds.database_url").getString())
    val postDao = jdbi.onDemand<PostDao>()

    val feedService = FeedService(postDao)

    routing {
        feed(feedService)

        // Handle all the other non-matched routes returning a 404 not found
        route("{...}") {
            handle {
                val error = JamBudsErrorResource(
                    code = HttpStatusCode.NotFound,
                    request = call.request.local.uri,
                    message = "Route not found"
                )
                call.respond(error)
            }
        }
    }
}

