package club.jambuds.web

import club.jambuds.service.LikeService
import club.jambuds.web.extensions.requireUser
import io.javalin.apibuilder.ApiBuilder.delete
import io.javalin.apibuilder.ApiBuilder.put
import io.javalin.http.Context

class LikeRoutes(private val likeService: LikeService) {
    fun register() {
        put("/api/likes/:songId", this::createSongLike)
        delete("/api/likes/:songId", this::deleteSongLike)
    }

    private fun createSongLike(ctx: Context) {
        val currentUser = ctx.requireUser()
        val songId = ctx.pathParam<Int>("songId").get()
        likeService.createSongLike(currentUser = currentUser, songId = songId)
        ctx.status(204)
    }

    private fun deleteSongLike(ctx: Context) {
        val currentUser = ctx.requireUser()
        val songId = ctx.pathParam<Int>("songId").get()
        likeService.deleteSongLike(currentUser = currentUser, songId = songId)
        ctx.status(204)
    }
}
