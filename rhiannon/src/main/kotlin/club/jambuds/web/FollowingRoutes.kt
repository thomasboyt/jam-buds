package club.jambuds.web

import club.jambuds.responses.FollowUserResponse
import club.jambuds.service.FollowingService
import club.jambuds.web.extensions.requireUser
import io.javalin.apibuilder.ApiBuilder
import io.javalin.http.Context

class FollowingRoutes(private val followingService: FollowingService) {
    fun register() {
        ApiBuilder.put("/api/following/:followName", this::followUser)
        ApiBuilder.delete("/api/following/:followName", this::unfollowUser)
    }

    private fun followUser(ctx: Context) {
        val currentUser = ctx.requireUser()
        val followName = ctx.pathParam<String>("followName").get()
        val followingUser = followingService.followUser(currentUser.id, followName)
        ctx.json(FollowUserResponse(followingUser))
    }

    private fun unfollowUser(ctx: Context) {
        val currentUser = ctx.requireUser()
        val followName = ctx.pathParam<String>("followName").get()
        followingService.unfollowUser(currentUser.id, followName)
        ctx.status(204)
    }
}
