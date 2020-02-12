package club.jambuds.model

import java.time.Instant

interface PostConnections {
    val songId: Int?
    val mixtapeId: Int?
}

data class Post(
    val id: Int,
    val createdAt: Instant,
    override val songId: Int?,
    override val mixtapeId: Int?,
    val userId: Int
) : PostConnections

data class AggregatedPost(
    override val songId: Int?,
    override val mixtapeId: Int?,
    val timestamp: Instant,
    val userNames: List<String>
) : PostConnections
