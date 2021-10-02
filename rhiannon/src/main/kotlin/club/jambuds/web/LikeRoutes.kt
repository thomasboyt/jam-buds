package club.jambuds.web

import club.jambuds.service.LikeService
import club.jambuds.web.extensions.requireUser
import club.jambuds.model.ItemType
import club.jambuds.model.LikeSource
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
        operationId="createLike",
        tags = ["Likes"],
        summary = "Like an item",
        responses = [OpenApiResponse("204")],
        pathParams = [
            OpenApiParam(
                name = "type",
                type = String::class,
                description = "One of 'songs', 'mixtapes, or 'albums'"
            ),
            OpenApiParam(name = "itemId", type = Int::class)
        ],
        queryParams = [
            OpenApiParam(
                name = "likeSource",
                required = true,
                type = LikeSource::class,
                description = "The origin of the like. 'post' indicates feed or playlist, 'like' " +
                    "indicates a likes list, 'mixtape' indicates a mixtape songs listing."
            ),
            OpenApiParam(
                name = "sourceMixtapeId",
                type = Int::class,
                description = "If likeSource is 'mixtape', this is the id of the source mixtape"
            ),
            OpenApiParam(
                name = "sourceUserNames",
                type = String::class,
                description = "If likeSource is 'like' or 'post', this is the name(s) of the source user (joined with a comma)"
            ),
        ]
    )
    private fun createLike(ctx: Context) {
        val currentUser = ctx.requireUser()
        val itemType = getItemType(ctx)
        val itemId = ctx.pathParamAsClass<Int>("itemId").get()
        val likeSource = ctx.queryParamAsClass<LikeSource>("likeSource").allowNullable().get()
        val sourceMixtapeId = ctx.queryParamAsClass<Int>("sourceMixtapeId").allowNullable().get()
        val sourceUserNames = ctx.queryParamAsClass<String>("sourceUserNames").allowNullable().get()
        likeService.createLike(currentUser, itemType, itemId, likeSource, sourceMixtapeId, sourceUserNames)
        ctx.status(204)
    }

    @OpenApi(
        operationId="deleteLike",
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
        val itemId = ctx.pathParamAsClass<Int>("itemId").get()
        likeService.deleteLike(currentUser, itemType, itemId)
        ctx.status(204)
    }

    private fun getItemType(ctx: Context): ItemType {
        val type = ctx.pathParamAsClass<String>("type").get()
        return when (type) {
            "songs" -> ItemType.SONG
            "mixtapes" -> ItemType.MIXTAPE
            "albums" -> ItemType.ALBUM
            else -> throw NotFoundResponse()
        }
    }
}
