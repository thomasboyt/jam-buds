package club.jambuds.web

import club.jambuds.model.ItemSource
import club.jambuds.responses.SearchDetailsResponse
import club.jambuds.responses.SearchResponse
import club.jambuds.service.SearchService
import io.javalin.apibuilder.ApiBuilder
import io.javalin.http.Context
import io.javalin.plugin.openapi.annotations.OpenApi
import io.javalin.plugin.openapi.annotations.OpenApiContent
import io.javalin.plugin.openapi.annotations.OpenApiParam
import io.javalin.plugin.openapi.annotations.OpenApiResponse

class SearchRoutes(private val searchService: SearchService) {
    fun register() {
        ApiBuilder.get("/api/search", this::search)
        ApiBuilder.get("/api/search-details/songs", this::songDetails)
        ApiBuilder.get("/api/search-details/albums", this::albumDetails)
    }

    @OpenApi(
        tags = ["Search"],
        summary = "Search for an item through Spotify",
        queryParams = [
            OpenApiParam(name = "type", description = "What type of item to search for ('song' or 'album')"),
            OpenApiParam(name = "query", description = "The search query")
        ],
        responses = [OpenApiResponse(
            "200",
            [OpenApiContent(SearchResponse::class)]
        )]
    )
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
            ctx.json(SearchResponse(songs = null, albums = albums))
        } else {
            val songs = searchService.searchSongs(query)
            ctx.json(SearchResponse(songs = songs, albums = null))
        }
    }

    @OpenApi(
        tags = ["Search"],
        summary = "Find additional song details for a given source and key",
        queryParams = [
            OpenApiParam(name = "source", required = true, type = ItemSource::class),
            OpenApiParam(name = "key", required = true)
        ],
        responses = [OpenApiResponse(
            "200",
            [OpenApiContent(SearchDetailsResponse::class)]
        )]
    )
    private fun songDetails(ctx: Context) {
        val source = ctx.queryParam<ItemSource>("source").get()
        val key = ctx.queryParam<String>("key").get()
        val details = searchService.getSongSearchDetails(source, key)
        ctx.json(details)
    }

    @OpenApi(
        tags = ["Search"],
        summary = "Find additional album details for a given source and key",
        queryParams = [
            OpenApiParam(name = "source", required = true, type = ItemSource::class),
            OpenApiParam(name = "key", required = true)
        ],
        responses = [OpenApiResponse(
            "200",
            [OpenApiContent(SearchDetailsResponse::class)]
        )]
    )
    private fun albumDetails(ctx: Context) {
        val source = ctx.queryParam<ItemSource>("source").get()
        val key = ctx.queryParam<String>("key").get()
        val details = searchService.getAlbumSearchDetails(source, key)
        ctx.json(details)
    }
}
