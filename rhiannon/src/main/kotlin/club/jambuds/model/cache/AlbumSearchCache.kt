package club.jambuds.model.cache

data class AlbumSearchCache(
    val title: String,
    val albumArt: String,
    val artists: List<String>,

    val searchedSpotify: Boolean,
    val spotifyId: String?,

    val searchedAppleMusic: Boolean,
    val appleMusicId: String?,
    val appleMusicUrl: String?,

    val searchedBandcamp: Boolean,
    val bandcampUrl: String?
)
