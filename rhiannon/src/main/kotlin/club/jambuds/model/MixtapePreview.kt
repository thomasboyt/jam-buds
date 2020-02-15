package club.jambuds.model

import com.google.gson.annotations.Expose
import java.time.Instant

data class MixtapePreview(
    // would love to not copy-paste this.
    @Expose val id: Int,
    val createdAt: Instant,
    @Expose val title: String,
    @Expose val slug: String,
    val userId: Int,
    @Expose val publishedAt: Instant?,

    @Expose val songCount: Int,
    @Expose val authorName: String
)