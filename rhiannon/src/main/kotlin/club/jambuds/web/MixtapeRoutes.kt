package club.jambuds.web

import club.jambuds.service.MixtapeService
import club.jambuds.web.extensions.currentUser
import club.jambuds.web.extensions.requireUser
import club.jambuds.web.extensions.validateJsonBody
import com.google.gson.annotations.Expose
import io.javalin.apibuilder.ApiBuilder
import io.javalin.http.Context
import io.javalin.http.NotFoundResponse
import javax.validation.constraints.NotNull

class MixtapeRoutes(private val mixtapeService: MixtapeService) {
    fun register() {
        ApiBuilder.post("/api/mixtapes", this::createMixtape)
        ApiBuilder.get("/api/mixtapes/:id", this::getMixtape)
        ApiBuilder.delete("/api/mixtapes/:id", this::deleteMixtape)

        ApiBuilder.post("/api/mixtapes/:mixtapeId/songs", this::addSongToMixtape)
        ApiBuilder.delete("/api/mixtapes/:mixtapeId/songs/:songId", this::removeSongFromMixtape)
    }

    data class CreateBody(
        @field:NotNull
        @Expose val title: String
    )

    private fun createMixtape(ctx: Context) {
        val currentUser = ctx.requireUser()
        val body = ctx.validateJsonBody(CreateBody::class.java)
        val mixtape = mixtapeService.createMixtape(body.title, currentUser.id)
        ctx.json(mixtape)
    }

    private fun getMixtape(ctx: Context) {
        val currentUserId = ctx.currentUser?.id
        val id = ctx.pathParam<Int>("id").get()

        val mixtape = mixtapeService.getMixtapeById(id, currentUserId = currentUserId)
            ?: throw NotFoundResponse("Could not find mixtape with id $id")

        ctx.json(mixtape)
    }

    private fun deleteMixtape(ctx: Context) {
        val currentUser = ctx.requireUser()
        val id = ctx.pathParam<Int>("id").get()

        mixtapeService.deleteMixtapeById(id, currentUserId = currentUser.id)

        ctx.status(204)
    }

    data class AddSongBody(
        @field:NotNull
        @Expose val spotifyId: String
    )

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
}
