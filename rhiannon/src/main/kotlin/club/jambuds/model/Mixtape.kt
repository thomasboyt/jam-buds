package club.jambuds.model

import com.google.gson.annotations.Expose
import java.time.Instant

data class Mixtape(
    @Expose val id: Int,
    val createdAt: Instant,
    @Expose val title: String,
    @Expose val slug: String,
    val userId: Int,
    @Expose val publishedAt: Instant?
)

