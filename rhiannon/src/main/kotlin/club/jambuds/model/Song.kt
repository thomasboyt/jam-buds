package club.jambuds.model

import com.google.gson.annotations.Expose
import java.time.Instant

data class Song(
    @Expose val id: Int,
    val createdAt: Instant,
    @Expose val title: String,
    @Expose val artists: List<String>,
    @Expose val album: String?,
    @Expose val albumArt: String?,
    @Expose val spotifyId: String?,
    @Expose val isrcId: String?,
    @Expose val appleMusicId: String?,
    @Expose val appleMusicUrl: String?
)
