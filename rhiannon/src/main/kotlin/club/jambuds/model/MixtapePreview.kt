package club.jambuds.model

import com.google.gson.annotations.Expose
import java.time.Instant
import org.jdbi.v3.core.mapper.Nested

data class MixtapePreview(
    @Expose val id: Int,
    val createdAt: Instant,
    val userId: Int,
    @Expose val title: String,
    @Expose val slug: String,
    @Expose val publishedAt: Instant?,
    @Expose val songCount: Int,
    @Expose val authorName: String,
    @Expose @Nested("meta") val meta: ItemMeta
)
