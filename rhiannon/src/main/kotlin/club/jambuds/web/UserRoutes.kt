package club.jambuds.web

import club.jambuds.responses.GetCurrentUserResponse
import club.jambuds.responses.TwitterFriendSuggestionsResponse
import club.jambuds.responses.UserFollowingResponse
import club.jambuds.service.UserService
import club.jambuds.web.extensions.currentUser
import club.jambuds.web.extensions.requireUser
import io.javalin.apibuilder.ApiBuilder.get
import io.javalin.http.Context
import io.javalin.http.NotFoundResponse

class UserRoutes(private val userService: UserService) {
    fun register() {
        get("/api/me", this::getCurrentUser)
        get("/api/friend-suggestions", this::getTwitterFriendSuggestions)
        get("/api/users/:userName/following", this::getUserFollowing)
        get("/api/users/:userName/followers", this::getUserFollowers)
    }

    private fun getCurrentUser(ctx: Context) {
        val currentUser = ctx.currentUser

        if (currentUser == null) {
            ctx.json(GetCurrentUserResponse(user = null))
            return
        }

        val serializedUser = userService.serializeCurrentUser(currentUser)

        ctx.json(GetCurrentUserResponse(user = serializedUser))
    }

    private fun getTwitterFriendSuggestions(ctx: Context) {
        val user = ctx.requireUser()
        val users = userService.getUnfollowedTwitterUsersForUser(user)
        ctx.json(TwitterFriendSuggestionsResponse(users))
    }

    private fun getUserFollowing(ctx: Context) {
        val userName = ctx.pathParam<String>("userName").get()
        val userProfile = userService.getUserProfileByName(userName)
            ?: throw NotFoundResponse("User not found with name $userName")

        val users = userService.getFollowingByUserId(userProfile.id)

        ctx.json(UserFollowingResponse(userProfile, users))
    }

    private fun getUserFollowers(ctx: Context) {
        val userName = ctx.pathParam<String>("userName").get()
        val userProfile = userService.getUserProfileByName(userName)
            ?: throw NotFoundResponse("User not found with name $userName")

        val users = userService.getFollowersByUserId(userProfile.id)

        ctx.json(UserFollowingResponse(userProfile, users))
    }
}
