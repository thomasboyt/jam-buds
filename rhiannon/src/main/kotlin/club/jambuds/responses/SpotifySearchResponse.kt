package club.jambuds.responses

import com.google.gson.annotations.Expose

data class SpotifySearchResponse(
    @Expose val songs: List<SongSearchResult>?,
    @Expose val albums: List<AlbumSearchResult>?
)
