package club.jambuds.model

import java.time.Instant

data class Post(
    val id: Int,
    val createdAt: Instant,
    val userId: Int,
    val songId: Int?,
    val mixtapeId: Int?
)
