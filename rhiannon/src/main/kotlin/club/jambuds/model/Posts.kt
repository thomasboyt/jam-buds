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
    val userId: Int
) : PlaylistPost {
    override val timestamp: Instant
        get() = this.createdAt
}

data class AggregatedPost(
    override val songId: Int?,
    override val mixtapeId: Int?,
    override val timestamp: Instant,
    val userNames: List<String>
) : PlaylistPost

