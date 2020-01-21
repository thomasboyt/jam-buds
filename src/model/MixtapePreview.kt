package model

import java.time.Instant

data class MixtapePreview(
    // TODO: Split into "Mixtape" resource
    val id: Int,
    val createdAt: Instant,
    val title: String,
    val slug: String,
    val userId: Int,
    val publishedAt: Instant?,

    val songCount: Int,
    val authorName: String
)
