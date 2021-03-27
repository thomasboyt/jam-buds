package club.jambuds.model.cache

import club.jambuds.clients.AppleMusicSearchSongItem
import club.jambuds.service.BandcampSong
import com.wrapper.spotify.model_objects.specification.Track

data class SongSearchCache(
    val title: String,
    val artists: List<String>,
    val album: String,
    val albumArt: String,
    val isrc: String?,

    val searchedSpotify: Boolean,
    val spotifyId: String?,

    val searchedAppleMusic: Boolean,
    val appleMusicId: String?,
    val appleMusicUrl: String?,

    val searchedBandcamp: Boolean,
    val bandcampUrl: String?,
    val bandcampId: String?,
    val bandcampStreamingAvailable: Boolean?
) {
    companion object {
        fun fromSpotify(track: Track): SongSearchCache {
            val isrc = track.externalIds.externalIds["isrc"]
            return SongSearchCache(
                title = track.name,
                album = track.album.name,
                artists = track.artists.map { it.name },
                albumArt = track.album.images[0].url,
                isrc = isrc,
                searchedSpotify = true,
                spotifyId = track.id,
                searchedAppleMusic = false,
                appleMusicId = null,
                appleMusicUrl = null,
                searchedBandcamp = false,
                bandcampId = null,
                bandcampUrl = null,
                bandcampStreamingAvailable = null
            )
        }

        fun fromAppleMusic(song: AppleMusicSearchSongItem): SongSearchCache {
            val artists = song.relationships.artists.data.map { it.attributes.name }
            return SongSearchCache(
                title = song.attributes.name,
                album = song.attributes.albumName,
                artists = artists,
                albumArt = song.attributes.artwork.getUrl(),
                isrc = song.attributes.isrc,
                searchedSpotify = false,
                spotifyId = null,
                searchedAppleMusic = true,
                appleMusicId = song.id,
                appleMusicUrl = song.attributes.url,
                searchedBandcamp = false,
                bandcampId = null,
                bandcampUrl = null,
                bandcampStreamingAvailable = null
            )
        }

        fun fromBandcamp(song: BandcampSong): SongSearchCache {
            return SongSearchCache(
                title = song.title,
                album = song.album,
                artists = listOf(song.artist),
                albumArt = song.albumArt,
                isrc = song.isrc,
                searchedSpotify = false,
                spotifyId = null,
                searchedAppleMusic = false,
                appleMusicId = null,
                appleMusicUrl = null,
                searchedBandcamp = true,
                bandcampId = song.bandcampId,
                bandcampUrl = song.bandcampUrl,
                bandcampStreamingAvailable = song.bandcampStreamingAvailable
            )
        }
    }
}
