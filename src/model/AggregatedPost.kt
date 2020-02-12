package club.jambuds.model

import java.time.Instant

data class AggregatedPost(
    val songId: Int?,
    val mixtapeId: Int?,
    val timestamp: Instant,
    val userNames: List<String>
)
