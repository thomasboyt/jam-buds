package web

import java.time.Instant
import java.time.DateTimeException
import io.ktor.application.*
import io.ktor.features.BadRequestException
import io.ktor.http.Parameters
import io.ktor.response.*
import io.ktor.routing.*
import service.FeedService

private fun getTimestampParam(params: Parameters, key: String): Instant? {
    val str = params[key] ?: return null
    return try {
        Instant.parse(str)
    } catch(err: DateTimeException) {
        throw BadRequestException("Invalid $key param")
    }
}

fun Routing.feed(feedService: FeedService) {
    get("/public-feed") {
        val params = call.request.queryParameters
        if (params.contains("beforeTimestamp") && params.contains("afterTimestamp")) {
            throw BadRequestException("Cannot have both before & after timestamps")
        }
        // TODO: catch timestamp parse errors instead of silently failing
        val beforeTimestamp = getTimestampParam(params, "beforeTimestamp")
        val afterTimestamp = getTimestampParam(params, "afterTimestamp")

        val feedItems = feedService.getPublicFeed(
            beforeTimestamp = beforeTimestamp,
            afterTimestamp =  afterTimestamp
        )
        call.respond(feedItems)
    }
}