package club.jambuds.model.cache

import club.jambuds.clients.AppleMusicSearchAlbumItem
import club.jambuds.service.BandcampAlbum
import com.wrapper.spotify.model_objects.specification.Album
import com.wrapper.spotify.model_objects.specification.AlbumSimplified
import com.wrapper.spotify.model_objects.specification.ArtistSimplified
import com.wrapper.spotify.model_objects.specification.Image

data class AlbumSearchCache(
    val title: String,
    val albumArt: String,
    val artists: List<String>,

    val searchedSpotify: Boolean,
    val spotifyId: String?,

    val searchedAppleMusic: Boolean,
    val appleMusicId: String?,
    val appleMusicUrl: String?,

    val searchedBandcamp: Boolean,
    val bandcampUrl: String?
) {
    companion object {
        private fun fromSpotifyInternal(
            title: String,
            artists: Array<ArtistSimplified>,
            images: Array<Image>,
            id: String
        ): AlbumSearchCache {
            return AlbumSearchCache(
                title = title,
                artists = artists.map { it.name },
                albumArt = images[0].url,
                searchedSpotify = true,
                spotifyId = id,
                searchedAppleMusic = false,
                appleMusicId = null,
                appleMusicUrl = null,
                searchedBandcamp = false,
                bandcampUrl = null
            )
        }

        fun fromSpotifyFull(album: Album): AlbumSearchCache {
            return fromSpotifyInternal(
                title = album.name,
                artists = album.artists,
                images = album.images,
                id = album.id
            )
        }

        fun fromSpotifySimplified(album: AlbumSimplified): AlbumSearchCache {
            return fromSpotifyInternal(
                title = album.name,
                artists = album.artists,
                images = album.images,
                id = album.id
            )
        }

        fun fromAppleMusic(album: AppleMusicSearchAlbumItem): AlbumSearchCache {
            val artists = album.relationships.artists.data.map { it.attributes.name }
            return AlbumSearchCache(
                title = album.attributes.name,
                artists = artists,
                albumArt = album.attributes.artwork.getUrl(),
                searchedSpotify = false,
                spotifyId = null,
                searchedAppleMusic = true,
                appleMusicId = album.id,
                appleMusicUrl = album.attributes.url,
                searchedBandcamp = false,
                bandcampUrl = null
            )
        }

        fun fromBandcamp(album: BandcampAlbum): AlbumSearchCache {
            return AlbumSearchCache(
                title = album.title,
                artists = listOf(album.artist),
                albumArt = album.albumArt,
                searchedSpotify = false,
                spotifyId = null,
                searchedAppleMusic = false,
                appleMusicId = null,
                appleMusicUrl = null,
                searchedBandcamp = true,
                bandcampUrl = album.bandcampUrl
            )
        }
    }
}
