package club.jambuds.model

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty
import java.time.Instant
import org.jdbi.v3.core.mapper.Nested

data class MixtapePreview(
    val id: Int,
    @JsonIgnore val createdAt: Instant?,
    @JsonIgnore val userId: Int?,
    val title: String,
    val slug: String,
    val publishedAt: Instant?,
    val songCount: Int,
    val authorName: String,
    @Nested("meta") val meta: ItemMeta
)
