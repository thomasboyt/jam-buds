package web

import io.ktor.application.*
import io.ktor.response.*
import io.ktor.routing.*
import service.FeedService

fun Routing.feed(feedService: FeedService) {
    get("/public-feed") {
        call.respond(feedService.getPublicFeed())
    }
}