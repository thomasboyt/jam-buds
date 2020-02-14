package club.jambuds.web

import club.jambuds.responses.FeedPlaylistResponse
import club.jambuds.responses.UserPlaylistResponse
import club.jambuds.service.PlaylistService
import club.jambuds.service.UserService
import club.jambuds.web.extensions.currentUser
import club.jambuds.web.extensions.requireUser
import io.javalin.apibuilder.ApiBuilder.get
import io.javalin.http.Context
import io.javalin.http.NotFoundResponse
import java.time.Instant

class PlaylistRoutes(
    private val playlistService: PlaylistService,
    private val userService: UserService
) {
    fun register() {
        get("/api/public-feed", this::getPublicFeed)
        get("/api/feed", this::getUserFeed)
        get("/api/playlists/:userName", this::getUserPlaylist)
        get("/api/playlists/:userName/likes", this::getUserLikesPlaylist)
    }

    private fun getPublicFeed(ctx: Context) {
        val currentUserId = ctx.currentUser?.id
        val timestamps = getTimestamps(ctx)

        val playlist = playlistService.getPublicFeed(
            currentUserId = currentUserId,
            beforeTimestamp = timestamps.beforeTimestamp,
            afterTimestamp = timestamps.afterTimestamp
        )
        val resp = FeedPlaylistResponse(
            items = playlist.items,
            limit = playlist.limit
        )
        ctx.json(resp)
    }

    private fun getUserFeed(ctx: Context) {
        val currentUserId = ctx.requireUser().id
        val timestamps = getTimestamps(ctx)

        val playlist = playlistService.getUserFeed(
            currentUserId = currentUserId,
            beforeTimestamp = timestamps.beforeTimestamp,
            afterTimestamp = timestamps.afterTimestamp
        )
        val resp = FeedPlaylistResponse(
            items = playlist.items,
            limit = playlist.limit
        )
        ctx.json(resp)
    }

    private fun getUserPlaylist(ctx: Context) {
        val currentUserId = ctx.currentUser?.id
        val timestamps = getTimestamps(ctx)
        val onlyMixtapes = ctx.queryParam<Boolean>("onlyMixtapes").getOrNull() ?: false

        val userName = ctx.pathParam<String>("userName").get()
        val userProfile = userService.getUserProfileByName(userName)
            ?: throw NotFoundResponse("User not found with name $userName")

        val playlist = playlistService.getUserPlaylist(
            userId = userProfile.id,
            currentUserId = currentUserId,
            beforeTimestamp = timestamps.beforeTimestamp,
            afterTimestamp = timestamps.afterTimestamp,
            onlyMixtapes = onlyMixtapes
        )
        val resp = UserPlaylistResponse(
            items = playlist.items,
            limit = playlist.limit,
            userProfile = userProfile
        )
        ctx.json(resp)
    }

    private fun getUserLikesPlaylist(ctx: Context) {
        val currentUserId = ctx.currentUser?.id
        val timestamps = getTimestamps(ctx)

        val userName = ctx.pathParam<String>("userName").get()
        val userProfile = userService.getUserProfileByName(userName)
            ?: throw NotFoundResponse("User not found with name $userName")

        val playlist = playlistService.getUserLikesPlaylist(
            userId = userProfile.id,
            currentUserId = currentUserId,
            beforeTimestamp = timestamps.beforeTimestamp,
            afterTimestamp = timestamps.afterTimestamp
        )
        val resp = UserPlaylistResponse(
            items = playlist.items,
            limit = playlist.limit,
            userProfile = userProfile
        )
        ctx.json(resp)
    }

    private data class Timestamps(val beforeTimestamp: Instant?, val afterTimestamp: Instant?)

    private fun getTimestamps(ctx: Context): Timestamps {
        val beforeTimestamp = ctx.queryParam<Instant>("beforeTimestamp").getOrNull()
        val afterTimestamp = ctx.queryParam<Instant>("afterTimestamp")
            .check(
                { beforeTimestamp == null },
                "cannot have both 'beforeTimestamp' and 'afterTimestamp'"
            )
            .getOrNull()
        return Timestamps(beforeTimestamp, afterTimestamp)
    }
}
