package club.jambuds.web

import club.jambuds.service.PostService
import club.jambuds.service.ReportService
import club.jambuds.web.extensions.requireUser
import club.jambuds.web.extensions.validateJsonBody
import com.fasterxml.jackson.annotation.JsonValue
import io.javalin.apibuilder.ApiBuilder
import io.javalin.http.Context
import io.javalin.plugin.openapi.annotations.OpenApi

class PostRoutes(private val postService: PostService, private val reportService: ReportService) {
    fun register() {
        ApiBuilder.post("/api/posts", this::createPost)
        ApiBuilder.delete("/api/posts/:postId", this::deletePost)
        ApiBuilder.put("/api/posts/:postId/report", this::reportPost)
    }

    enum class PostItemType(@get:JsonValue val type: String) {
        SONG("song"),
        ALBUM("album")
    }

    data class PostSongBody(
        val type: PostItemType,
        val spotifyId: String,
        val noteText: String?,
        val postTweet: Boolean
    )

    @OpenApi(ignore = true)
    private fun createPost(ctx: Context) {
        val user = ctx.requireUser()
        val body = ctx.validateJsonBody(PostSongBody::class.java)
        when (body.type) {
            PostItemType.ALBUM -> {
                val album = postService.createPostForAlbum(
                    user,
                    spotifyId = body.spotifyId,
                    noteText = body.noteText,
                    postTweet = body.postTweet
                )
                ctx.json(album)
            }
            PostItemType.SONG -> {
                val song = postService.createPostForSong(
                    user,
                    spotifyId = body.spotifyId,
                    noteText = body.noteText,
                    postTweet = body.postTweet
                )
                ctx.json(song)
            }
        }
    }

    @OpenApi(ignore = true)
    private fun deletePost(ctx: Context) {
        val user = ctx.requireUser()
        val postId = ctx.pathParam<Int>("postId").get()
        postService.deletePost(
            user,
            postId = postId
        )
        ctx.status(204)
    }

    @OpenApi(ignore = true)
    private fun reportPost(ctx: Context) {
        val user = ctx.requireUser()
        val postId = ctx.pathParam<Int>("postId").get()
        reportService.createPostReport(user, postId)
        ctx.status(204)
    }
}
