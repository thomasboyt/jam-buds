package club.jambuds.responses

data class AlbumSearchResult(
    val title: String,
    val artists: List<String>,
    val albumArt: String,
    val spotifyId: String
)
