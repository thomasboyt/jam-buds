package club.jambuds.model

import com.fasterxml.jackson.annotation.JsonIgnore
import java.time.Instant
import org.jdbi.v3.core.mapper.Nested

data class SongWithMeta(
    val id: Int,
    @JsonIgnore val createdAt: Instant?,
    val title: String,
    val artists: List<String>,
    val album: String?,
    val albumArt: String?,
    val spotifyId: String?,
    val isrcId: String?,
    val appleMusicId: String?,
    val appleMusicUrl: String?,
    val bandcampId: String?,
    val bandcampUrl: String?,
    @Nested("meta") val meta: ItemMeta
) {
    constructor(s: Song, meta: ItemMeta) : this(
        s.id,
        s.createdAt,
        s.title,
        s.artists,
        s.album,
        s.albumArt,
        s.spotifyId,
        s.isrcId,
        s.appleMusicId,
        s.appleMusicUrl,
        s.bandcampId,
        s.bandcampUrl,
        meta
    )
}
