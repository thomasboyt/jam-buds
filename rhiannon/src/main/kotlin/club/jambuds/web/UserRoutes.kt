package club.jambuds.web

import club.jambuds.responses.TwitterFriendSuggestionsResponse
import club.jambuds.service.UserService
import club.jambuds.web.extensions.requireUser
import io.javalin.apibuilder.ApiBuilder.get
import io.javalin.http.Context

class UserRoutes(private val userService: UserService) {
    fun register() {
        get("/api/friend-suggestions", this::getTwitterFriendSuggestions)
    }

    private fun getTwitterFriendSuggestions(ctx: Context) {
        val user = ctx.requireUser()
        val users = userService.getUnfollowedTwitterUsersForUser(user)
        ctx.json(TwitterFriendSuggestionsResponse(users))
    }
}
