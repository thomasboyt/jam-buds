package club.jambuds.responses

data class SongSearchResult(
    val title: String,
    val album: String,
    val artists: List<String>,
    val spotifyId: String,
    val albumArt: String
)
