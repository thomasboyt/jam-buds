package club.jambuds.model

import com.google.gson.annotations.Expose
import java.time.Instant
import org.jdbi.v3.core.mapper.Nested

data class Album(
    @Expose val id: Int,
    val createdAt: Instant,
    @Expose val title: String,
    @Expose val artists: List<String>,
    @Expose val albumArt: String?,
    @Expose val spotifyId: String?,
    @Expose val appleMusicId: String?,
    @Expose val appleMusicUrl: String?,
    @Expose @Nested("meta") val meta: ItemMeta?
)
