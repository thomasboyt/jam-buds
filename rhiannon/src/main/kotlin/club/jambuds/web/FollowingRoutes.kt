package club.jambuds.web

import club.jambuds.responses.FollowUserResponse
import club.jambuds.service.FollowingService
import club.jambuds.web.extensions.requireUser
import io.javalin.apibuilder.ApiBuilder
import io.javalin.http.Context
import io.javalin.plugin.openapi.annotations.OpenApi
import io.javalin.plugin.openapi.annotations.OpenApiContent
import io.javalin.plugin.openapi.annotations.OpenApiParam
import io.javalin.plugin.openapi.annotations.OpenApiResponse

class FollowingRoutes(private val followingService: FollowingService) {
    fun register() {
        ApiBuilder.put("/api/following/:followName", this::followUser)
        ApiBuilder.delete("/api/following/:followName", this::unfollowUser)
    }

    @OpenApi(
        tags = ["Following"],
        summary = "Follow a user by name",
        responses = [OpenApiResponse("200", [OpenApiContent(FollowUserResponse::class)])],
        pathParams = [OpenApiParam(name = "followName")]
    )
    private fun followUser(ctx: Context) {
        val currentUser = ctx.requireUser()
        val followName = ctx.pathParamAsClass<String>("followName").get()
        val followingUser = followingService.followUser(currentUser, followName)
        ctx.json(FollowUserResponse(followingUser))
    }

    @OpenApi(
        tags = ["Following"],
        summary = "Unfollow a user by name",
        responses = [OpenApiResponse("204")],
        pathParams = [OpenApiParam(name = "followName")]
    )
    private fun unfollowUser(ctx: Context) {
        val currentUser = ctx.requireUser()
        val followName = ctx.pathParamAsClass<String>("followName").get()
        followingService.unfollowUser(currentUser, followName)
        ctx.status(204)
    }
}
