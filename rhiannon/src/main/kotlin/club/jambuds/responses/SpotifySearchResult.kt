package club.jambuds.responses

import com.google.gson.annotations.Expose

data class SpotifySearchResult(
    @Expose val title: String,
    @Expose val album: String,
    @Expose val artists: List<String>,
    @Expose val spotifyId: String,
    @Expose val albumArt: String
)
