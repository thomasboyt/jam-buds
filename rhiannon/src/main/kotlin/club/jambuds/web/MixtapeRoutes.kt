package club.jambuds.web

import club.jambuds.responses.GetDraftMixtapesResponse
import club.jambuds.responses.RenameMixtapeResponse
import club.jambuds.service.MixtapeService
import club.jambuds.web.extensions.currentUser
import club.jambuds.web.extensions.requireUser
import club.jambuds.web.extensions.validateJsonBody
import io.javalin.apibuilder.ApiBuilder
import io.javalin.http.Context
import io.javalin.http.NotFoundResponse
import io.javalin.plugin.openapi.annotations.OpenApi

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

    @OpenApi(ignore = true)
    private fun createMixtape(ctx: Context) {
        val currentUser = ctx.requireUser()
        val body = ctx.validateJsonBody(CreateBody::class.java)
        val mixtape = mixtapeService.createMixtape(body.title, currentUser.id)
        ctx.json(mixtape)
    }

    @OpenApi(ignore = true)
    private fun getMixtape(ctx: Context) {
        val currentUserId = ctx.currentUser?.id
        val id = ctx.pathParam<Int>("id").get()

        val mixtape = mixtapeService.getMixtapeById(id, currentUserId = currentUserId)
            ?: throw NotFoundResponse("Could not find mixtape with id $id")

        ctx.json(mixtape)
    }

    @OpenApi(ignore = true)
    private fun deleteMixtape(ctx: Context) {
        val currentUser = ctx.requireUser()
        val id = ctx.pathParam<Int>("id").get()

        mixtapeService.deleteMixtapeById(id, currentUserId = currentUser.id)

        ctx.status(204)
    }

    data class AddSongBody(
        val spotifyId: String
    )

    @OpenApi(ignore = true)
    private fun addSongToMixtape(ctx: Context) {
        val currentUser = ctx.requireUser()
        val mixtapeId = ctx.pathParam<Int>("mixtapeId").get()
        val spotifyId = ctx.validateJsonBody(AddSongBody::class.java).spotifyId

        val song = mixtapeService.addSongToMixtape(
            mixtapeId = mixtapeId,
            currentUser = currentUser,
            spotifyId = spotifyId
        )

        ctx.json(song)
    }

    @OpenApi(ignore = true)
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

    @OpenApi(ignore = true)
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

    @OpenApi(ignore = true)
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

    @OpenApi(ignore = true)
    private fun publishMixtape(ctx: Context) {
        val currentUser = ctx.requireUser()
        val mixtapeId = ctx.pathParam<Int>("mixtapeId").get()

        mixtapeService.publishMixtape(mixtapeId = mixtapeId, currentUser = currentUser)

        ctx.status(204)
    }

    @OpenApi(ignore = true)
    private fun getDraftMixtapes(ctx: Context) {
        val currentUser = ctx.requireUser()
        val mixtapes = mixtapeService.getDraftMixtapesByUser(currentUser)
        ctx.json(GetDraftMixtapesResponse(mixtapes))
    }
}
