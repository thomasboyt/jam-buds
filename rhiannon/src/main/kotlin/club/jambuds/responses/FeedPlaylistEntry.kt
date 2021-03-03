package club.jambuds.responses

import club.jambuds.model.Album
import club.jambuds.model.ItemType
import club.jambuds.model.MixtapePreview
import club.jambuds.model.SongWithMeta
import java.time.Instant

data class FeedPlaylistEntry(
    override val timestamp: Instant,
    override val song: SongWithMeta? = null,
    override val mixtape: MixtapePreview? = null,
    override val album: Album? = null,
    override val type: ItemType,
    val posts: List<FeedPlaylistPost>
) : PlaylistEntry
