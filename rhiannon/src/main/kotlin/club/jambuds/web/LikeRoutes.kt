package club.jambuds.web

import club.jambuds.service.LikeService
import club.jambuds.web.extensions.requireUser
import club.jambuds.model.ItemType
import io.javalin.apibuilder.ApiBuilder.delete
import io.javalin.apibuilder.ApiBuilder.put
import io.javalin.http.Context
import io.javalin.http.NotFoundResponse
import io.javalin.plugin.openapi.annotations.OpenApi
import io.javalin.plugin.openapi.annotations.OpenApiParam
import io.javalin.plugin.openapi.annotations.OpenApiResponse

class LikeRoutes(private val likeService: LikeService) {
    fun register() {
        put("/api/likes/:type/:itemId", this::createLike)
        delete("/api/likes/:type/:itemId", this::deleteLike)
    }

    @OpenApi(
        tags = ["Likes"],
        summary = "Like an item",
        responses = [OpenApiResponse("204")],
        pathParams = [
            OpenApiParam(
                name = "type",
                type = String::class,
                description = "One of 'songs', 'mixtapes, or 'albums'"
            ),
            OpenApiParam(name = "itemId",  type = Int::class)
        ]
    )
    private fun createLike(ctx: Context) {
        val currentUser = ctx.requireUser()
        val itemType = getItemType(ctx)
        val itemId = ctx.pathParam<Int>("itemId").get()
        likeService.createLike(currentUser, itemType, itemId)
        ctx.status(204)
    }

    @OpenApi(
        tags = ["Likes"],
        summary = "Unlike an item",
        responses = [OpenApiResponse("204")],
        pathParams = [
            OpenApiParam(
                name = "type",
                type = String::class,
                description = "One of 'songs', 'mixtapes, or 'albums'"
            ),
            OpenApiParam(name = "itemId",  type = Int::class)
        ]
    )
    private fun deleteLike(ctx: Context) {
        val currentUser = ctx.requireUser()
        val itemType = getItemType(ctx)
        val itemId = ctx.pathParam<Int>("itemId").get()
        likeService.deleteLike(currentUser, itemType, itemId)
        ctx.status(204)
    }

    private fun getItemType(ctx: Context): ItemType {
        val type = ctx.pathParam<String>("type").get()
        return when (type) {
            "songs" -> ItemType.SONG
            "mixtapes" -> ItemType.MIXTAPE
            "albums" -> ItemType.ALBUM
            else -> throw NotFoundResponse()
        }
    }
}
