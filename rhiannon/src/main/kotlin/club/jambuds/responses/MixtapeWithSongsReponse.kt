package club.jambuds.responses

import club.jambuds.model.SongWithMeta
import com.google.gson.annotations.Expose
import java.time.Instant

data class MixtapeWithSongsReponse(
    @Expose val id: Int,
    @Expose val title: String,
    @Expose val slug: String,
    @Expose val isPublished: Boolean,
    @Expose val publishedAt: Instant?,
    @Expose val tracks: List<SongWithMeta>,
    @Expose val author: UserProfile
)
