package club.jambuds.web

import club.jambuds.service.PostService
import club.jambuds.service.ReportService
import club.jambuds.util.FormValidationErrorResponse
import club.jambuds.web.extensions.requireUser
import club.jambuds.web.extensions.validateJsonBody
import com.google.gson.annotations.Expose
import io.javalin.apibuilder.ApiBuilder
import io.javalin.http.Context
import javax.validation.constraints.NotNull

class PostRoutes(private val postService: PostService, private val reportService: ReportService) {
    fun register() {
        ApiBuilder.post("/api/posts", this::createPost)
        ApiBuilder.delete("/api/posts/:postId", this::deletePost)
        ApiBuilder.put("/api/posts/:postId/report", this::reportPost)
    }

    data class PostSongBody(
        @field:NotNull
        @Expose val type: String,
        @field:NotNull
        @Expose val spotifyId: String,

        @Expose val noteText: String?,
        @Expose val postTweet: Boolean
    )

    private fun createPost(ctx: Context) {
        val user = ctx.requireUser()
        val body = ctx.validateJsonBody(PostSongBody::class.java)
        if (body.type == "album") {
            val song = postService.createPostForAlbum(
                user,
                spotifyId = body.spotifyId,
                noteText = body.noteText,
                postTweet = body.postTweet
            )
            ctx.json(song)
        } else if (body.type == "song") {
            val song = postService.createPostForSong(
                user,
                spotifyId = body.spotifyId,
                noteText = body.noteText,
                postTweet = body.postTweet
            )
            ctx.json(song)
        } else {
            throw FormValidationErrorResponse("type", "must be 'album' or 'song'")
        }
    }

    private fun deletePost(ctx: Context) {
        val user = ctx.requireUser()
        val postId = ctx.pathParam<Int>("postId").get()
        postService.deletePost(
            user,
            postId = postId
        )
        ctx.status(204)
    }

    private fun reportPost(ctx: Context) {
        val user = ctx.requireUser()
        val postId = ctx.pathParam<Int>("postId").get()
        reportService.createPostReport(user, postId)
        ctx.status(204)
    }
}
