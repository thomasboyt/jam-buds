package club.jambuds.web

import club.jambuds.model.Album
import club.jambuds.model.ItemSource
import club.jambuds.model.SongWithMeta
import club.jambuds.service.PostService
import club.jambuds.service.ReportService
import club.jambuds.web.extensions.requireUser
import club.jambuds.web.extensions.validateJsonBody
import com.fasterxml.jackson.annotation.JsonValue
import io.javalin.apibuilder.ApiBuilder
import io.javalin.http.Context
import io.javalin.plugin.openapi.annotations.OpenApi
import io.javalin.plugin.openapi.annotations.OpenApiContent
import io.javalin.plugin.openapi.annotations.OpenApiParam
import io.javalin.plugin.openapi.annotations.OpenApiRequestBody
import io.javalin.plugin.openapi.annotations.OpenApiResponse

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
        val source: ItemSource,
        val key: String,
        val noteText: String?,
        val postTweet: Boolean
    )

    @OpenApi(
        tags = ["Posts"],
        summary = "Post a new item",
        requestBody = OpenApiRequestBody([OpenApiContent(PostSongBody::class)]),
        responses = [OpenApiResponse(
            "200",
            [OpenApiContent(Album::class), OpenApiContent(SongWithMeta::class)]
        )]
    )
    private fun createPost(ctx: Context) {
        val user = ctx.requireUser()
        val body = ctx.validateJsonBody(PostSongBody::class.java)
        when (body.type) {
            PostItemType.ALBUM -> {
                val album = postService.createPostForAlbum(
                    user,
                    source = body.source,
                    key = body.key,
                    noteText = body.noteText,
                    postTweet = body.postTweet
                )
                ctx.json(album)
            }
            PostItemType.SONG -> {
                val song = postService.createPostForSong(
                    user,
                    source = body.source,
                    key = body.key,
                    noteText = body.noteText,
                    postTweet = body.postTweet
                )
                ctx.json(song)
            }
        }
    }

    @OpenApi(
        tags = ["Posts"],
        summary = "Delete a post by ID",
        pathParams = [OpenApiParam(name = "postId",  type = Int::class)],
        responses = [OpenApiResponse("204")]
    )
    private fun deletePost(ctx: Context) {
        val user = ctx.requireUser()
        val postId = ctx.pathParam<Int>("postId").get()
        postService.deletePost(
            user,
            postId = postId
        )
        ctx.status(204)
    }

    @OpenApi(
        tags = ["Posts"],
        summary = "Report a post by ID",
        pathParams = [OpenApiParam(name = "postId",  type = Int::class)],
        responses = [OpenApiResponse("204")]
    )
    private fun reportPost(ctx: Context) {
        val user = ctx.requireUser()
        val postId = ctx.pathParam<Int>("postId").get()
        reportService.createPostReport(user, postId)
        ctx.status(204)
    }
}
