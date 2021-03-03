package club.jambuds.model

import com.fasterxml.jackson.annotation.JsonIgnore
import java.time.Instant

data class Mixtape(
    val id: Int,
    @JsonIgnore val createdAt: Instant,
    @JsonIgnore val userId: Int,
    val title: String,
    val slug: String,
    val publishedAt: Instant?
)
