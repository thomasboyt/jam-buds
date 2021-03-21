package club.jambuds.responses

data class SearchResponse(
    val songs: List<SongSearchResult>?,
    val albums: List<AlbumSearchResult>?
)
