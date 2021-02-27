package club.jambuds.model.cache

import com.wrapper.spotify.model_objects.specification.AlbumSimplified

data class SpotifyAlbumSearchCache(
    val spotify: AlbumSimplified,
    val didHydrateExternalIds: Boolean,
    val appleMusicId: String?,
    val appleMusicUrl: String?
)
