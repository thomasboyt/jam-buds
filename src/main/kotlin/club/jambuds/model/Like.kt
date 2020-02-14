package club.jambuds.model

import java.time.Instant

data class Like(
    val id: Int,
    val createdAt: Instant,
    override val songId: Int?,
    override val mixtapeId: Int?,
    val userId: Int
) : PlaylistPost {
    override val timestamp: Instant
    get() = this.createdAt
}
