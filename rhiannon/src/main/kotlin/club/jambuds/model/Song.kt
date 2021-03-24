package club.jambuds.model

import com.fasterxml.jackson.annotation.JsonIgnore
import java.time.Instant

data class Song(
    val id: Int,
    @JsonIgnore val createdAt: Instant,
    val title: String,
    val artists: List<String>,
    val album: String?,
    val albumArt: String?,
    val spotifyId: String?,
    val isrcId: String?,
    val appleMusicId: String?,
    val appleMusicUrl: String?,
    val bandcampId: String?,
    val bandcampUrl: String?
)
