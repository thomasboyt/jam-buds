package club.jambuds.model

import java.time.Instant

data class SongWithMeta(
    // TODO: Split these fields into "Song" resource for songs w/o meta attached
    val id: Int?,
    val createdAt: Instant,
    val title: String,
    val artists: List<String>,
    val album: String?,
    val albumArt: String?,
    val spotifyId: String?,
    val isrcId: String?,
    val appleMusicId: String?,
    val appleMusicUrl: String?,
    // Meta
    val likeCount: Int,
    val isLiked: Boolean
)
