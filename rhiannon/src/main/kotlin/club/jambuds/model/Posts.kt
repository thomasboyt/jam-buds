package club.jambuds.model

import java.time.Instant

interface PlaylistPost {
    val songId: Int?
    val mixtapeId: Int?
    val timestamp: Instant
}

data class Post(
    val id: Int,
    val createdAt: Instant,
    override val songId: Int?,
    override val mixtapeId: Int?,
    val userId: Int,
    val note: String?
) : PlaylistPost {
    override val timestamp: Instant
        get() = this.createdAt
}

data class AggregatedPostItem(
    val userName: String,
    val note: String?,
    val createdAt: Instant
)

data class AggregatedPost(
    override val songId: Int?,
    override val mixtapeId: Int?,
    override val timestamp: Instant,
    val posts: List<AggregatedPostItem>
) : PlaylistPost

