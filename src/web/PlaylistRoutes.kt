package club.jambuds.web

import club.jambuds.service.PlaylistService
import club.jambuds.web.extensions.currentUser
import club.jambuds.web.extensions.requireUser
import io.javalin.http.Context
import java.time.Instant

class PlaylistRoutes(private val playlistService: PlaylistService) {
    fun getPublicFeed(ctx: Context) {
        val currentUserId = ctx.currentUser?.id
        val beforeTimestamp = ctx.queryParam<Instant>("beforeTimestamp").getOrNull()
        val afterTimestamp = ctx.queryParam<Instant>("afterTimestamp")
            .check(
                { beforeTimestamp == null },
                "cannot have both 'beforeTimestamp' and 'afterTimestamp'"
            )
            .getOrNull()

        val feedItems = playlistService.getPublicFeed(
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

        val feedItems = playlistService.getUserFeed(
            currentUserId = currentUser.id,
            beforeTimestamp = beforeTimestamp,
            afterTimestamp = afterTimestamp
        )
        ctx.json(feedItems)
    }
}
