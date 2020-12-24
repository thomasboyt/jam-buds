package club.jambuds.web

import club.jambuds.responses.GetCurrentUserResponse
import club.jambuds.responses.GetUserProfileResponse
import club.jambuds.responses.TwitterFriendSuggestionsResponse
import club.jambuds.responses.UserFollowingResponse
import club.jambuds.service.UserService
import club.jambuds.web.extensions.currentUser
import club.jambuds.web.extensions.requireUser
import io.javalin.apibuilder.ApiBuilder.get
import io.javalin.http.Context
import io.javalin.http.NotFoundResponse
import io.javalin.plugin.openapi.annotations.OpenApi
import io.javalin.plugin.openapi.annotations.OpenApiContent
import io.javalin.plugin.openapi.annotations.OpenApiResponse
import io.javalin.plugin.openapi.annotations.OpenApiSecurity

class UserRoutes(private val userService: UserService) {
    fun register() {
        get("/api/me", this::getCurrentUser)
        get("/api/friend-suggestions", this::getTwitterFriendSuggestions)
        get("/api/users/:userName", this::getUserProfile)
        get("/api/users/:userName/following", this::getUserFollowing)
        get("/api/users/:userName/followers", this::getUserFollowers)
    }

    @OpenApi(
        summary = "Fetch the current authenticated user",
        tags = ["User"],
        responses = [OpenApiResponse("200", [OpenApiContent(GetCurrentUserResponse::class)])],
        security = [OpenApiSecurity(name = "apiKey")]
    )
    private fun getCurrentUser(ctx: Context) {
        val currentUser = ctx.currentUser

        if (currentUser == null) {
            ctx.json(GetCurrentUserResponse(user = null))
            return
        }

        val serializedUser = userService.serializeCurrentUser(currentUser)

        ctx.json(GetCurrentUserResponse(user = serializedUser))
    }

    @OpenApi(ignore = true)
    private fun getUserProfile(ctx: Context) {
        val userName = ctx.pathParam<String>("userName").get()
        val profile = userService.getUserProfileByName(userName)
            ?: throw NotFoundResponse("User not found with name $userName")
        ctx.json(GetUserProfileResponse(userProfile = profile))
    }

    @OpenApi(ignore = true)
    private fun getTwitterFriendSuggestions(ctx: Context) {
        val user = ctx.requireUser()
        val users = userService.getUnfollowedTwitterUsersForUser(user)
        ctx.json(TwitterFriendSuggestionsResponse(users))
    }

    @OpenApi(ignore = true)
    private fun getUserFollowing(ctx: Context) {
        val userName = ctx.pathParam<String>("userName").get()
        val userProfile = userService.getUserProfileByName(userName)
            ?: throw NotFoundResponse("User not found with name $userName")

        val users = userService.getFollowingByUserId(userProfile.id)

        ctx.json(UserFollowingResponse(users))
    }

    @OpenApi(ignore = true)
    private fun getUserFollowers(ctx: Context) {
        val userName = ctx.pathParam<String>("userName").get()
        val userProfile = userService.getUserProfileByName(userName)
            ?: throw NotFoundResponse("User not found with name $userName")

        val users = userService.getFollowersByUserId(userProfile.id)

        ctx.json(UserFollowingResponse(users))
    }
}
