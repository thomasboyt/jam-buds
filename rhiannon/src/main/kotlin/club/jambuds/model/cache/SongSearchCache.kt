package club.jambuds.model.cache

data class SongSearchCache(
    val title: String,
    val artists: List<String>,
    val album: String,
    val albumArt: String,
    val isrc: String?,

    val searchedSpotify: Boolean,
    val spotifyId: String?,

    val searchedAppleMusic: Boolean,
    val appleMusicId: String?,
    val appleMusicUrl: String?,

    val searchedBandcamp: Boolean,
    val bandcampUrl: String?,
    val bandcampId: String?,
    val bandcampStreamingAvailable: Boolean?
)
