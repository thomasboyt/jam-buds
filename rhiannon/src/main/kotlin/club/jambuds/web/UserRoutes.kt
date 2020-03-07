package club.jambuds.web

import club.jambuds.responses.GetCurrentUserResponse
import club.jambuds.responses.TwitterFriendSuggestionsResponse
import club.jambuds.service.UserService
import club.jambuds.web.extensions.currentUser
import club.jambuds.web.extensions.requireUser
import io.javalin.apibuilder.ApiBuilder.get
import io.javalin.http.Context

class UserRoutes(private val userService: UserService) {
    fun register() {
        get("/api/me", this::getCurrentUser)
        get("/api/friend-suggestions", this::getTwitterFriendSuggestions)
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
}
