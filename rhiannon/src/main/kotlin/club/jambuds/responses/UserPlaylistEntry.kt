package club.jambuds.responses

import club.jambuds.model.Album
import club.jambuds.model.ItemType
import club.jambuds.model.MixtapePreview
import club.jambuds.model.SongWithMeta
import java.time.Instant

data class UserPlaylistEntry(
    override val timestamp: Instant,
    override val song: SongWithMeta? = null,
    override val mixtape: MixtapePreview? = null,
    override val album: Album? = null,
    override val type: ItemType,
    // only posts, not likes, have postId. maybe should redo this resource in the future :[
    val postId: Int?,
    val noteText: String?
) : PlaylistEntry
