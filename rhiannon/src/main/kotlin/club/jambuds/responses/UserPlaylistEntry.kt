package club.jambuds.responses

import club.jambuds.model.Album
import club.jambuds.model.ItemType
import club.jambuds.model.MixtapePreview
import club.jambuds.model.SongWithMeta
import com.google.gson.annotations.Expose
import java.time.Instant

data class UserPlaylistEntry(
    @Expose override val timestamp: Instant,
    @Expose override val song: SongWithMeta? = null,
    @Expose override val mixtape: MixtapePreview? = null,
    @Expose override val album: Album? = null,
    @Expose override val type: ItemType,
    // only posts, not likes, have postId. maybe should redo this resource in the future :[
    @Expose val postId: Int?,
    @Expose val noteText: String?
) : PlaylistEntry
