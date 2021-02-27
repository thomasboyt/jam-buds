package club.jambuds.responses

import com.google.gson.annotations.Expose

data class AlbumSearchResult(
    @Expose val title: String,
    @Expose val artists: List<String>,
    @Expose val albumArt: String,
    @Expose val spotifyId: String
)
