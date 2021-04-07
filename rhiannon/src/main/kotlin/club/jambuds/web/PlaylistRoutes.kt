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
import io.javalin.plugin.openapi.annotations.OpenApi
import io.javalin.plugin.openapi.annotations.OpenApiContent
import io.javalin.plugin.openapi.annotations.OpenApiParam
import io.javalin.plugin.openapi.annotations.OpenApiResponse
import java.time.Instant

class PlaylistRoutes(
    private val playlistService: PlaylistService,
    private val userService: UserService
) {
    fun register() {
        get("/api/public-feed", this::getPublicFeed)
        get("/api/feed", this::getUserFeed)
        get("/api/playlists/:userName", this::getUserPlaylist)
        get("/api/playlists/:userName/liked", this::getUserLikesPlaylist)
    }

    @OpenApi(
        tags = ["Playlists"],
        summary = "Fetch the public feed.",
        responses = [OpenApiResponse("200", [OpenApiContent(FeedPlaylistResponse::class)])],
        queryParams = [
            OpenApiParam(name = "before", description = "Filter to only entries before this timestamp"),
            OpenApiParam(name = "after", description = "Filter to only entries after this timestamp")
        ]
    )
    private fun getPublicFeed(ctx: Context) {
        val currentUserId = ctx.currentUser?.id
        val timestamps = getTimestamps(ctx)

        val playlist = playlistService.getPublicFeed(
            currentUserId = currentUserId,
            beforeTimestamp = timestamps.beforeTimestamp,
            afterTimestamp = timestamps.afterTimestamp
        )
        val profiles = userService.getUserProfilesFromFeedEntries(playlist)
        val resp = FeedPlaylistResponse(
            items = playlist.items,
            limit = playlist.limit,
            profiles = profiles
        )
        ctx.json(resp)
    }

    @OpenApi(
        tags = ["Playlists"],
        summary = "Fetch the current user's feed.",
        responses = [OpenApiResponse("200", [OpenApiContent(FeedPlaylistResponse::class)])],
        queryParams = [
            OpenApiParam(name = "before", description = "Filter to only entries before this timestamp"),
            OpenApiParam(name = "after", description = "Filter to only entries after this timestamp")
        ]
    )
    private fun getUserFeed(ctx: Context) {
        val currentUserId = ctx.requireUser().id
        val timestamps = getTimestamps(ctx)

        val playlist = playlistService.getUserFeed(
            currentUserId = currentUserId,
            beforeTimestamp = timestamps.beforeTimestamp,
            afterTimestamp = timestamps.afterTimestamp
        )
        val profiles = userService.getUserProfilesFromFeedEntries(playlist)
        val resp = FeedPlaylistResponse(
            items = playlist.items,
            limit = playlist.limit,
            profiles = profiles
        )
        ctx.json(resp)
    }

    @OpenApi(
        tags = ["Playlists"],
        summary = "Fetch the playlist (recent posts) of a specific user.",
        responses = [OpenApiResponse("200", [OpenApiContent(UserPlaylistResponse::class)])],
        pathParams = [OpenApiParam(name = "userName")],
        queryParams = [
            OpenApiParam(name = "before", description = "Filter to only entries before this timestamp"),
            OpenApiParam(name = "after", description = "Filter to only entries after this timestamp"),
            OpenApiParam(name = "onlyMixtapes", description = "If true, only returns mixtapes", type = Boolean::class)
        ]
    )
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
            profiles = listOf(userProfile)
        )
        ctx.json(resp)
    }

    @OpenApi(
        tags = ["Playlists"],
        summary = "Fetch the likes of a specific user.",
        responses = [OpenApiResponse("200", [OpenApiContent(UserPlaylistResponse::class)])],
        pathParams = [OpenApiParam(name = "userName")],
        queryParams = [
            OpenApiParam(name = "before", description = "Filter to only entries before this timestamp"),
            OpenApiParam(name = "after", description = "Filter to only entries after this timestamp")
        ]
    )
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
        val profiles = userService.getUserProfilesFromUserPlaylist(playlist)
        val resp = UserPlaylistResponse(
            items = playlist.items,
            limit = playlist.limit,
            profiles = listOf(userProfile).plus(profiles).distinct()
        )
        ctx.json(resp)
    }

    private data class Timestamps(val beforeTimestamp: Instant?, val afterTimestamp: Instant?)

    private fun getTimestamps(ctx: Context): Timestamps {
        val beforeTimestamp = ctx.queryParam<Instant>("before").getOrNull()
        val afterTimestamp = ctx.queryParam<Instant>("after")
            .check(
                { beforeTimestamp == null },
                "cannot have both 'beforeTimestamp' and 'afterTimestamp'"
            )
            .getOrNull()
        return Timestamps(beforeTimestamp, afterTimestamp)
    }
}
