package club.jambuds.responses

import club.jambuds.model.MixtapePreview
import club.jambuds.model.SongWithMeta
import com.google.gson.annotations.Expose
import java.time.Instant

data class UserPlaylistEntry(
    @Expose override val timestamp: Instant,
    @Expose override val song: SongWithMeta? = null,
    @Expose override val mixtape: MixtapePreview? = null,
    @Expose override val type: PlaylistEntryType
) : PlaylistEntry

