package club.jambuds.model

import com.google.gson.annotations.Expose
import java.time.Instant

data class Mixtape(
    @Expose val id: Int,
    val createdAt: Instant,
    val userId: Int,
    @Expose val title: String,
    @Expose val slug: String,
    @Expose val publishedAt: Instant?
)
