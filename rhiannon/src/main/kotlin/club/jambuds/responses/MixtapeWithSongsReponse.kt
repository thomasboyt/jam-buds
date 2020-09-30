package club.jambuds.responses

import club.jambuds.model.MixtapePreview
import club.jambuds.model.SongWithMeta
import com.google.gson.annotations.Expose

data class MixtapeWithSongsReponse(
    @Expose val mixtape: MixtapePreview,
    @Expose val tracks: List<SongWithMeta>,
    @Expose val author: UserProfile
)
