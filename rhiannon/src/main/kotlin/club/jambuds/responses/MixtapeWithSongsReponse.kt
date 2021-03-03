package club.jambuds.responses

import club.jambuds.model.MixtapePreview
import club.jambuds.model.SongWithMeta

data class MixtapeWithSongsReponse(
    val mixtape: MixtapePreview,
    val tracks: List<SongWithMeta>,
    val author: UserProfile
)
