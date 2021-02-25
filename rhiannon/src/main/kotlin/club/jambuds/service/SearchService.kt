package club.jambuds.service

import club.jambuds.dao.SongDao
import club.jambuds.dao.cache.SearchCacheDao
import club.jambuds.model.ItemMeta
import club.jambuds.model.SongWithMeta
import club.jambuds.model.User
import club.jambuds.model.cache.SearchCacheEntry
import club.jambuds.responses.SearchDetailsResponse
import club.jambuds.responses.SpotifySearchResult
import com.wrapper.spotify.model_objects.specification.Track
import io.javalin.http.BadRequestResponse
import io.javalin.http.NotFoundResponse

class SearchService(
    private val spotifyApiService: SpotifyApiService,
    private val appleMusicService: AppleMusicService,
    private val songDao: SongDao,
    private val searchCacheDao: SearchCacheDao,
    private val disableAppleMusic: Boolean = false
) {
    fun search(query: String): List<SpotifySearchResult> {
        val results = spotifyApiService.search(query)
        val tracks = dedupeListByIsrc(results)

        tracks.forEach { track ->
            createSearchCacheFromTrack(track)
        }

        return tracks.map { serializeSpotifySearchResult(it) }
    }

    fun getSearchDetails(spotifyId: String): SearchDetailsResponse {
        val cacheEntry = getOrHydrateSongCache(spotifyId)
            ?: throw NotFoundResponse("Could not find song with Spotify ID $spotifyId")

        return SearchDetailsResponse(
            spotifyId = spotifyId,
            appleMusicId = cacheEntry.appleMusicId
        )
    }

    // TODO: possibly move this to a new service
    fun getOrCreateSong(spotifyId: String, currentUser: User): SongWithMeta {
        val existingSong = songDao.getSongBySpotifyId(spotifyId, currentUser.id)

        if (existingSong != null) {
            return existingSong
        }

        val cacheEntry = getOrHydrateSongCache(spotifyId)
            ?: throw BadRequestResponse("Could not find song with Spotify ID $spotifyId")

        // TODO: theoretically I think delegation could help avoid this but I don't know how
        //       it works :(
        val s = songDao.createSongFromCacheEntry(cacheEntry)
        return SongWithMeta(
            s.id, s.createdAt, s.title, s.artists, s.album, s.albumArt,
            s.spotifyId, s.isrcId, s.appleMusicId, s.appleMusicUrl,
            ItemMeta(likeCount = 0, isLiked = false)
        )
    }

    private fun createSearchCacheFromTrack(track: Track): SearchCacheEntry {
        val isrc = track.externalIds.externalIds["isrc"]
        val cacheEntry = SearchCacheEntry(
            spotify = track,
            isrc = isrc,
            didHydrateExternalIds = false,
            appleMusicId = null,
            appleMusicUrl = null
        )
        searchCacheDao.setSearchCacheEntry(track.id, cacheEntry)
        return cacheEntry
    }

    private fun updateSearchCacheWithAppleId(
        spotifyId: String,
        appleMusicId: String?,
        appleMusicUrl: String?
    ): SearchCacheEntry {
        val cacheEntry = searchCacheDao.getSearchCacheEntry(spotifyId)

        val updated = cacheEntry!!.copy(
            didHydrateExternalIds = true,
            appleMusicId = appleMusicId,
            appleMusicUrl = appleMusicUrl
        )

        searchCacheDao.setSearchCacheEntry(spotifyId, updated)

        return updated
    }

    private fun getOrHydrateSongCache(spotifyId: String): SearchCacheEntry? {
        // TODO: if song is already in database, use that
        var cacheEntry = searchCacheDao.getSearchCacheEntry(spotifyId)

        if (cacheEntry == null) {
            val track = spotifyApiService.getTrackById(spotifyId)
                ?: return null
            cacheEntry = createSearchCacheFromTrack(track)
        }

        if (cacheEntry.didHydrateExternalIds) {
            return cacheEntry
        }

        val isrc = cacheEntry.isrc

        val appleMusicDetails = if (isrc == null || disableAppleMusic) {
            null
        } else {
            appleMusicService.getSongDetailsByIsrc(isrc)
        }

        return updateSearchCacheWithAppleId(
            spotifyId,
            appleMusicDetails?.id,
            appleMusicDetails?.attributes?.url
        )
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
