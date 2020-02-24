package club.jambuds.responses

import com.google.gson.annotations.Expose
import java.time.Instant

data class FeedPlaylistPost(
    @Expose val userName: String,
    @Expose val noteText: String?,
    @Expose val timestamp: Instant
)
