package club.jambuds.responses

data class SpotifySearchResponse(
    val songs: List<SongSearchResult>?,
    val albums: List<AlbumSearchResult>?
)
