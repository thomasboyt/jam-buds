package club.jambuds.responses

import club.jambuds.model.MixtapePreview
import club.jambuds.model.SongWithMeta
import java.time.Instant

interface PlaylistEntry {
    val timestamp: Instant
    val song: SongWithMeta?
    val mixtape: MixtapePreview?
    val type: PlaylistEntryType
}
