package club.jambuds.model

import com.fasterxml.jackson.annotation.JsonIgnore
import java.time.Instant
import org.jdbi.v3.core.mapper.Nested

data class Album(
    val id: Int,
    @JsonIgnore val createdAt: Instant?,
    val title: String,
    val artists: List<String>,
    val albumArt: String?,
    val spotifyId: String?,
    val appleMusicId: String?,
    val appleMusicUrl: String?,
    @Nested("meta") val meta: ItemMeta?
)
