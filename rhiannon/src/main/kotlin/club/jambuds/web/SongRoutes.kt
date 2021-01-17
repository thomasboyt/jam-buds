package club.jambuds.web

import club.jambuds.service.SongService
import club.jambuds.web.extensions.requireUser
import io.javalin.apibuilder.ApiBuilder
import io.javalin.http.Context

class SongRoutes(private val songService: SongService) {
    fun register() {
        ApiBuilder.put("/api/songs/:songId/listened", this::markSongListened)
        ApiBuilder.delete("/api/songs/:songId/listened", this::unmarkSongListened)
    }

    private fun markSongListened(ctx: Context) {
        val currentUser = ctx.requireUser()
        val songId = ctx.pathParam<Int>("songId").get()
        songService.markSongListened(currentUser = currentUser, songId = songId)
        ctx.status(204)
    }

    private fun unmarkSongListened(ctx: Context) {
        val currentUser = ctx.requireUser()
        val songId = ctx.pathParam<Int>("songId").get()
        songService.unmarkSongListened(currentUser = currentUser, songId = songId)
        ctx.status(204)
    }
}
