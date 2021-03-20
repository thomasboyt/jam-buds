package club.jambuds.responses

import java.time.Instant

data class FeedPlaylistPost(
    val postId: Int,
    val userName: String,
    val noteText: String?,
    val timestamp: Instant
)
