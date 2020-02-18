package club.jambuds.web

import club.jambuds.service.PostService
import club.jambuds.web.extensions.requireUser
import club.jambuds.web.extensions.validateJsonBody
import com.google.gson.annotations.Expose
import io.javalin.apibuilder.ApiBuilder
import io.javalin.http.Context
import javax.validation.constraints.NotNull

class PostRoutes(private val postService: PostService) {
    fun register() {
        ApiBuilder.post("/api/posts", this::postSong)
        // ApiBuilder.delete("/api/posts/:songId", this::deletePost)
    }

    data class PostSongBody(
        @field:NotNull
        @Expose val spotifyId: String
    )

    private fun postSong(ctx: Context) {
        val user = ctx.requireUser()
        val body = ctx.validateJsonBody(PostSongBody::class.java)
        val song =
            postService.createPostForSong(currentUserId = user.id, spotifyId = body.spotifyId)
        ctx.json(song)
    }
}
