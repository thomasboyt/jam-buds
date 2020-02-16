package club.jambuds.service

import club.jambuds.responses.SpotifySearchResult
import com.wrapper.spotify.model_objects.specification.Track

class SearchService(private val spotifyApiService: SpotifyApiService) {
    fun search(query: String): List<SpotifySearchResult> {
        val results = spotifyApiService.search(query)
        val tracks = dedupeListByIsrc(results)
        return tracks.map { serializeSpotifySearchResult(it) }
    }

    /**
     * Many songs on Spotify have multiple entries for e.g. deluxe editions, or live
     * albums that are also on deluxe editions, or whatnot. This simply filters out
     * some of these entries by seeing if they have the same ISRC.
     *
     * This generally doesn't (and shouldn't) filter out e.g. clean versions of
     * explicit songs, or remastered versions of songs on later rereleases.
     */
    private fun dedupeListByIsrc(results: Array<Track>): List<Track> {
        val seenIsrcs = mutableSetOf<String>()
        val dedupedResults = mutableListOf<Track>()
        results.distinctBy { it.externalIds.externalIds["isrc"] }

        results.forEach {
            val isrc = it.externalIds.externalIds["isrc"]
            if (isrc == null) {
                dedupedResults.add(it)
            } else {
                if (!seenIsrcs.contains(isrc)) {
                    dedupedResults.add(it)
                    seenIsrcs.add(isrc)
                }
            }
        }

        return dedupedResults
    }

    private fun serializeSpotifySearchResult(track: Track): SpotifySearchResult {
        return SpotifySearchResult(
            title = track.name,
            album = track.album.name,
            artists = track.artists.map { it.name },
            spotifyId = track.id,
            albumArt = track.album.images[0].url
        )
    }
}
