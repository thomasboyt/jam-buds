package club.jambuds.web

import club.jambuds.responses.SpotifySearchResponse
import club.jambuds.service.SearchService
import io.javalin.apibuilder.ApiBuilder
import io.javalin.http.Context

class SearchRoutes(private val searchService: SearchService) {
    fun register() {
        ApiBuilder.get("/api/spotify-search", this::spotifySearch)
        // ApiBuilder.get("/api/spotify-details/:spotifyId", this::getDetailsForSpotifyTrack)
    }

    private fun spotifySearch(ctx: Context) {
        val query = ctx.queryParam<String>("query").get()
        val results = searchService.search(query)

        ctx.json(SpotifySearchResponse(songs = results))
    }
}
