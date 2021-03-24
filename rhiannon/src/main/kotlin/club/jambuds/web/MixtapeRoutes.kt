package club.jambuds.web

import club.jambuds.model.SongWithMeta
import club.jambuds.model.ItemSource
import club.jambuds.responses.GetDraftMixtapesResponse
import club.jambuds.responses.MixtapeWithSongsReponse
import club.jambuds.responses.RenameMixtapeResponse
import club.jambuds.service.MixtapeService
import club.jambuds.web.extensions.currentUser
import club.jambuds.web.extensions.requireUser
import club.jambuds.web.extensions.validateJsonBody
import io.javalin.apibuilder.ApiBuilder
import io.javalin.http.Context
import io.javalin.http.NotFoundResponse
import io.javalin.plugin.openapi.annotations.OpenApi
import io.javalin.plugin.openapi.annotations.OpenApiContent
import io.javalin.plugin.openapi.annotations.OpenApiParam
import io.javalin.plugin.openapi.annotations.OpenApiRequestBody
import io.javalin.plugin.openapi.annotations.OpenApiResponse

class MixtapeRoutes(private val mixtapeService: MixtapeService) {
    fun register() {
        ApiBuilder.post("/api/mixtapes", this::createMixtape)
        ApiBuilder.get("/api/mixtapes/:id", this::getMixtape)
        ApiBuilder.delete("/api/mixtapes/:id", this::deleteMixtape)

        ApiBuilder.post("/api/mixtapes/:mixtapeId/songs", this::addSongToMixtape)
        ApiBuilder.delete("/api/mixtapes/:mixtapeId/songs/:songId", this::removeSongFromMixtape)
        ApiBuilder.post("/api/mixtapes/:mixtapeId/order", this::reorderSongsInMixtape)
        ApiBuilder.post("/api/mixtapes/:mixtapeId/title", this::renameMixtape)
        ApiBuilder.post("/api/mixtapes/:mixtapeId/publish", this::publishMixtape)

        ApiBuilder.get("/api/draft-mixtapes", this::getDraftMixtapes)
    }

    data class CreateBody(
        val title: String
    )

    @OpenApi(
        tags = ["Mixtapes"],
        summary = "Create a new mixtape",
        requestBody = OpenApiRequestBody([OpenApiContent(CreateBody::class)]),
        responses = [OpenApiResponse("200", [OpenApiContent(MixtapeWithSongsReponse::class)])]
    )
    private fun createMixtape(ctx: Context) {
        val currentUser = ctx.requireUser()
        val body = ctx.validateJsonBody(CreateBody::class.java)
        val mixtape = mixtapeService.createMixtape(body.title, currentUser.id)
        ctx.json(mixtape)
    }

    @OpenApi(
        tags = ["Mixtapes"],
        summary = "Fetch a mixtape",
        pathParams = [OpenApiParam("id", type = Int::class)],
        responses = [OpenApiResponse("200", [OpenApiContent(MixtapeWithSongsReponse::class)])]
    )
    private fun getMixtape(ctx: Context) {
        val currentUserId = ctx.currentUser?.id
        val id = ctx.pathParam<Int>("id").get()

        val mixtape = mixtapeService.getMixtapeById(id, currentUserId = currentUserId)
            ?: throw NotFoundResponse("Could not find mixtape with id $id")

        ctx.json(mixtape)
    }

    @OpenApi(
        tags = ["Mixtapes"],
        summary = "Delete a mixtape",
        pathParams = [OpenApiParam("id", type = Int::class)],
        responses = [OpenApiResponse("204")]
    )
    private fun deleteMixtape(ctx: Context) {
        val currentUser = ctx.requireUser()
        val id = ctx.pathParam<Int>("id").get()

        mixtapeService.deleteMixtapeById(id, currentUserId = currentUser.id)

        ctx.status(204)
    }

    data class AddSongBody(
        val source: ItemSource,
        val key: String
    )

    @OpenApi(
        tags = ["Mixtapes"],
        summary = "Add a song to a mixtape",
        pathParams = [OpenApiParam("mixtapeId", type = Int::class)],
        requestBody = OpenApiRequestBody([OpenApiContent(AddSongBody::class)]),
        responses = [OpenApiResponse("200", [OpenApiContent(SongWithMeta::class)])]
    )
    private fun addSongToMixtape(ctx: Context) {
        val currentUser = ctx.requireUser()
        val mixtapeId = ctx.pathParam<Int>("mixtapeId").get()
        val body = ctx.validateJsonBody(AddSongBody::class.java)

        val song = mixtapeService.addSongToMixtape(
            mixtapeId = mixtapeId,
            currentUser = currentUser,
            source = body.source,
            key = body.key
        )

        ctx.json(song)
    }

    @OpenApi(
        tags = ["Mixtapes"],
        summary = "Remove a song from a mixtape",
        pathParams = [
            OpenApiParam("mixtapeId", type = Int::class),
            OpenApiParam("songId", type = Int::class)
         ],
        responses = [OpenApiResponse("204")]
    )
    private fun removeSongFromMixtape(ctx: Context) {
        val currentUser = ctx.requireUser()
        val mixtapeId = ctx.pathParam<Int>("mixtapeId").get()
        val songId = ctx.pathParam<Int>("songId").get()

        mixtapeService.removeSongFromMixtape(
            mixtapeId = mixtapeId,
            songId = songId,
            currentUser = currentUser
        )

        ctx.status(204)
    }

    data class ReorderSongsBody(
        val songOrder: List<Int>
    )

    @OpenApi(
        tags = ["Mixtapes"],
        summary = "Reorder songs in a mixtape",
        pathParams = [OpenApiParam("mixtapeId", type = Int::class)],
        requestBody = OpenApiRequestBody([OpenApiContent(ReorderSongsBody::class)]),
        responses = [OpenApiResponse("204")]
    )
    private fun reorderSongsInMixtape(ctx: Context) {
        val currentUser = ctx.requireUser()
        val mixtapeId = ctx.pathParam<Int>("mixtapeId").get()
        val body = ctx.validateJsonBody(ReorderSongsBody::class.java)

        mixtapeService.reorderSongsInMixtape(
            mixtapeId = mixtapeId,
            songIds = body.songOrder,
            currentUser = currentUser
        )

        ctx.status(204)
    }

    data class RenameMixtapeBody(
        val title: String
    )

    @OpenApi(
        tags = ["Mixtapes"],
        summary = "Rename a mixtape",
        pathParams = [OpenApiParam("mixtapeId", type = Int::class)],
        requestBody = OpenApiRequestBody([OpenApiContent(RenameMixtapeBody::class)]),
        responses = [OpenApiResponse("200", [OpenApiContent(RenameMixtapeResponse::class)])]
    )
    private fun renameMixtape(ctx: Context) {
        val currentUser = ctx.requireUser()
        val mixtapeId = ctx.pathParam<Int>("mixtapeId").get()
        val body = ctx.validateJsonBody(RenameMixtapeBody::class.java)

        val newSlug = mixtapeService.renameMixtape(
            mixtapeId = mixtapeId,
            title = body.title,
            currentUser = currentUser
        )

        ctx.json(RenameMixtapeResponse(newSlug))
    }

    @OpenApi(
        tags = ["Mixtapes"],
        summary = "Publish a mixtape",
        pathParams = [OpenApiParam("mixtapeId", type = Int::class)],
        responses = [OpenApiResponse("204")]
    )
    private fun publishMixtape(ctx: Context) {
        val currentUser = ctx.requireUser()
        val mixtapeId = ctx.pathParam<Int>("mixtapeId").get()

        mixtapeService.publishMixtape(mixtapeId = mixtapeId, currentUser = currentUser)

        ctx.status(204)
    }

    @OpenApi(
        tags = ["Mixtapes"],
        summary = "Get the current user's draft mixtapes",
        responses = [OpenApiResponse(
            "200",
            [OpenApiContent(GetDraftMixtapesResponse::class)]
        )]
    )
    private fun getDraftMixtapes(ctx: Context) {
        val currentUser = ctx.requireUser()
        val mixtapes = mixtapeService.getDraftMixtapesByUser(currentUser)
        ctx.json(GetDraftMixtapesResponse(mixtapes))
    }
}
