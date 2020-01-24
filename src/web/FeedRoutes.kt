package web

import java.time.Instant
import java.time.DateTimeException
import io.ktor.application.*
import io.ktor.features.BadRequestException
import io.ktor.http.Parameters
import io.ktor.response.*
import io.ktor.routing.*
import service.FeedService

private data class FeedParams(
    val currentUserId: Int?,
    val beforeTimestamp: Instant?,
    val afterTimestamp: Instant?
)

private fun getTimestampParam(params: Parameters, key: String): Instant? {
    val str = params[key] ?: return null
    return try {
        Instant.parse(str)
    } catch(err: DateTimeException) {
        throw BadRequestException("Invalid $key param")
    }
}

private fun parseParams(params: Parameters): FeedParams {
    if (params.contains("beforeTimestamp") && params.contains("afterTimestamp")) {
        throw BadRequestException("Cannot have both before & after timestamps")
    }
    val beforeTimestamp = getTimestampParam(params, "beforeTimestamp")
    val afterTimestamp = getTimestampParam(params, "afterTimestamp")

    val currentUserId = try {
        params["currentUserId"]?.toInt()
    } catch (e:  NumberFormatException) {
        throw BadRequestException("Invalid currentUserId param")
    }

    return FeedParams(currentUserId, beforeTimestamp, afterTimestamp)
}

fun Routing.feed(feedService: FeedService) {
    get("/public-feed") {
        val params = parseParams(call.request.queryParameters)

        val feedItems = feedService.getPublicFeed(
            currentUserId = params.currentUserId,
            beforeTimestamp = params.beforeTimestamp,
            afterTimestamp =  params.afterTimestamp
        )
        call.respond(feedItems)
    }

    get("/feed") {
        val params = parseParams(call.request.queryParameters)

        if (params.currentUserId == null) {
            throw BadRequestException("currentUserId must be set")
        }

        val feedItems = feedService.getUserFeed(
            currentUserId = params.currentUserId,
            beforeTimestamp = params.beforeTimestamp,
            afterTimestamp =  params.afterTimestamp
        )
        call.respond(feedItems)
    }
}