package club.jambuds.web

import club.jambuds.responses.SpotifySearchResponse
import club.jambuds.service.SearchService
import io.javalin.apibuilder.ApiBuilder
import io.javalin.http.Context
import io.javalin.plugin.openapi.annotations.OpenApi

class SearchRoutes(private val searchService: SearchService) {
    fun register() {
        ApiBuilder.get("/api/search", this::search)
        ApiBuilder.get("/api/search-details/songs/:spotifyId", this::songDetails)
        ApiBuilder.get("/api/search-details/albums/:spotifyId", this::albumDetails)
    }

    @OpenApi(ignore = true)
    private fun search(ctx: Context) {
        val query = ctx.queryParam<String>("query").get()
        val type = ctx.queryParam<String>("type")
            .check(
                { it == "song" || it == "album" },
                "type has to be 'song' or 'album'"
            )
            .get()
        if (type == "album") {
            val albums = searchService.searchAlbums(query)
            ctx.json(SpotifySearchResponse(songs = null, albums = albums))
        } else {
            val songs = searchService.searchSongs(query)
            ctx.json(SpotifySearchResponse(songs = songs, albums = null))
        }
    }

    @OpenApi(ignore = true)
    private fun songDetails(ctx: Context) {
        val spotifyId = ctx.pathParam<String>("spotifyId").get()
        val details = searchService.getSongSearchDetails(spotifyId)
        ctx.json(details)
    }

    @OpenApi(ignore = true)
    private fun albumDetails(ctx: Context) {
        val spotifyId = ctx.pathParam<String>("spotifyId").get()
        val details = searchService.getAlbumSearchDetails(spotifyId)
        ctx.json(details)
    }
}
