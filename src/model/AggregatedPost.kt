package model

import java.time.LocalDateTime

data class AggregatedPost(
    val songId: Int?,
    val mixtapeId: Int?,
    val timestamp: LocalDateTime,
    val userNames: List<String>
)

