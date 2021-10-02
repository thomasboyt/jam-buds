package club.jambuds.web

import club.jambuds.service.SongService
import club.jambuds.web.extensions.requireUser
import io.javalin.apibuilder.ApiBuilder
import io.javalin.http.Context
import io.javalin.plugin.openapi.annotations.OpenApi
import io.javalin.plugin.openapi.annotations.OpenApiParam
import io.javalin.plugin.openapi.annotations.OpenApiResponse

class SongRoutes(private val songService: SongService) {
    fun register() {
        ApiBuilder.put("/api/songs/:songId/listened", this::markSongListened)
        ApiBuilder.delete("/api/songs/:songId/listened", this::unmarkSongListened)
    }

    @OpenApi(
        tags = ["Listened status"],
        summary = "Mark song as listened",
        pathParams = [OpenApiParam(name = "songId", type = Int::class)],
        responses = [OpenApiResponse("204")]
    )
    private fun markSongListened(ctx: Context) {
        val currentUser = ctx.requireUser()
        val songId = ctx.pathParamAsClass<Int>("songId").get()
        songService.markSongListened(currentUser = currentUser, songId = songId)
        ctx.status(204)
    }

    @OpenApi(
        tags = ["Listened status"],
        summary = "Mark song as unlistened",
        pathParams = [OpenApiParam(name = "songId", type = Int::class)],
        responses = [OpenApiResponse("204")]
    )
    private fun unmarkSongListened(ctx: Context) {
        val currentUser = ctx.requireUser()
        val songId = ctx.pathParamAsClass<Int>("songId").get()
        songService.unmarkSongListened(currentUser = currentUser, songId = songId)
        ctx.status(204)
    }
}
