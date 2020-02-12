package club.jambuds.responses

import com.google.gson.annotations.Expose

data class FeedPlaylistResponse(
    @Expose val items: List<FeedPlaylistEntry>,
    @Expose val limit: Int
)
