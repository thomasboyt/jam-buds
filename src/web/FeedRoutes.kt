package web

import io.javalin.http.Context
import java.time.Instant
import service.FeedService
import web.extensions.*

class FeedRoutes(private val feedService: FeedService) {
    fun getPublicFeed(ctx: Context) {
        val currentUserId = ctx.currentUser?.id
        val beforeTimestamp = ctx.queryParam<Instant>("beforeTimestamp").getOrNull()
        val afterTimestamp = ctx.queryParam<Instant>("afterTimestamp")
            .check(
                { beforeTimestamp == null },
                "cannot have both 'beforeTimestamp' and 'afterTimestamp'"
            )
            .getOrNull()

        val feedItems = feedService.getPublicFeed(
            currentUserId = currentUserId,
            beforeTimestamp = beforeTimestamp,
            afterTimestamp = afterTimestamp
        )
        ctx.json(feedItems)
    }

    fun getUserFeed(ctx: Context) {
        val currentUser = ctx.requireUser()
        val beforeTimestamp = ctx.queryParam<Instant>("beforeTimestamp").getOrNull()
        val afterTimestamp = ctx.queryParam<Instant>("afterTimestamp")
            .check(
                { beforeTimestamp == null },
                "cannot have both 'beforeTimestamp' and 'afterTimestamp'"
            )
            .getOrNull()

        val feedItems = feedService.getUserFeed(
            currentUserId = currentUser.id,
            beforeTimestamp = beforeTimestamp,
            afterTimestamp = afterTimestamp
        )
        ctx.json(feedItems)
    }
}