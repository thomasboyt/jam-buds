package club.jambuds.model.cache

import com.wrapper.spotify.model_objects.specification.Track

data class SpotifyTrackSearchCache(
    val spotify: Track,
    val isrc: String?,
    val didHydrateExternalIds: Boolean,
    val appleMusicId: String?,
    val appleMusicUrl: String?
)
