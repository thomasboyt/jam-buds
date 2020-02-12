package club.jambuds.model

import com.google.gson.annotations.Expose
import java.time.Instant

data class SongWithMeta(
    // TODO: Split these fields into "Song" resource for songs w/o meta attached
    @Expose val id: Int,
    val createdAt: Instant,
    @Expose val title: String,
    @Expose val artists: List<String>,
    @Expose val album: String?,
    @Expose val albumArt: String?,
    @Expose val spotifyId: String?,
    @Expose val isrcId: String?,
    @Expose val appleMusicId: String?,
    @Expose val appleMusicUrl: String?,
    // Meta
    @Expose val likeCount: Int,
    @Expose val isLiked: Boolean
)
