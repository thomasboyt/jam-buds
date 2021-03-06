package club.jambuds.model

import club.jambuds.util.ZonedTsToInstantJsonDeserializer
import com.fasterxml.jackson.databind.annotation.JsonDeserialize
import java.time.Instant

interface PlaylistPost {
    val songId: Int?
    val mixtapeId: Int?
    val albumId: Int?
    val timestamp: Instant
}

data class Post(
    val id: Int,
    val createdAt: Instant,
    override val songId: Int?,
    override val mixtapeId: Int?,
    override val albumId: Int?,
    val userId: Int,
    val note: String?
) : PlaylistPost {
    override val timestamp: Instant
        get() = this.createdAt
}

data class AggregatedPostItem(
    val id: Int,
    val userName: String,
    val note: String?,
    @JsonDeserialize(using = ZonedTsToInstantJsonDeserializer::class)
    val createdAt: Instant
)

data class AggregatedPost(
    override val songId: Int?,
    override val mixtapeId: Int?,
    override val albumId: Int?,
    override val timestamp: Instant,
    val posts: List<AggregatedPostItem>
) : PlaylistPost
