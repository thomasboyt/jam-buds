package club.jambuds.service

import club.jambuds.dao.AlbumDao
import club.jambuds.dao.SongDao
import club.jambuds.dao.cache.SearchCacheDao
import club.jambuds.model.Album
import club.jambuds.model.ItemMeta
import club.jambuds.model.SongWithMeta
import club.jambuds.model.User
import club.jambuds.model.cache.AlbumSearchCache
import club.jambuds.model.ItemSource
import club.jambuds.model.ItemType
import club.jambuds.model.cache.SongSearchCache
import club.jambuds.responses.AlbumSearchResult
import club.jambuds.responses.SearchDetailsResponse
import club.jambuds.responses.SongSearchResult
import com.wrapper.spotify.model_objects.specification.ArtistSimplified as SpotifyArtist
import com.wrapper.spotify.model_objects.specification.Image as SpotifyImage
import com.wrapper.spotify.model_objects.specification.Track
import io.javalin.http.NotFoundResponse

class SearchService(
    private val spotifyApiService: SpotifyApiService,
    private val appleMusicService: AppleMusicService,
    private val bandcampService: BandcampService,
    private val songDao: SongDao,
    private val albumDao: AlbumDao,
    private val searchCacheDao: SearchCacheDao,
    private val disableAppleMusic: Boolean = false
) {
    fun searchSongs(query: String): List<SongSearchResult> {
        val bandcampUrlType = bandcampService.bandcampUrlType(query)
        if (bandcampUrlType == ItemType.SONG) {
            val item = findAndCacheSong(ItemSource.BANDCAMP, query)
                ?: return emptyList()
            return listOf(serializeSongSearchResult(ItemSource.BANDCAMP, item))
        }

        val results = spotifyApiService.searchTracks(query)
        val tracks = dedupeListByIsrc(results)

        val cacheEntries = tracks.map { track ->
            createSearchCacheFromSpotifyTrack(track)
        }

        return cacheEntries.map { serializeSongSearchResult(ItemSource.SPOTIFY, it) }
    }

    fun searchAlbums(query: String): List<AlbumSearchResult> {
        val bandcampUrlType = bandcampService.bandcampUrlType(query)
        if (bandcampUrlType == ItemType.ALBUM) {
            val item = findAndCacheAlbum(ItemSource.BANDCAMP, query)
                ?: return emptyList()
            return listOf(serializeAlbumSearchResult(ItemSource.BANDCAMP, item))
        }

        val results = spotifyApiService.searchAlbums(query)
        val cacheEntries = results.map { album ->
            createSearchCacheFromSpotifyAlbum(album.name, album.artists, album.images, album.id)
        }
        return cacheEntries.map { serializeAlbumSearchResult(ItemSource.SPOTIFY, it) }
    }

    fun getSongSearchDetails(source: ItemSource, key: String): SearchDetailsResponse {
        val cacheEntry = getOrHydrateSongCache(source, key)
            ?: throw NotFoundResponse("Could not find song with source $source and key $key")

        return SearchDetailsResponse(
            spotifyId = cacheEntry.spotifyId,
            appleMusicId = cacheEntry.appleMusicId,
            appleMusicUrl = cacheEntry.appleMusicUrl,
            bandcampId = cacheEntry.bandcampId,
            bandcampUrl = cacheEntry.bandcampUrl
        )
    }

    fun getAlbumSearchDetails(source: ItemSource, key: String): SearchDetailsResponse {
        val cacheEntry = getOrHydrateAlbumCache(source, key)
            ?: throw NotFoundResponse("Could not find album with source $source and key $key")

        return SearchDetailsResponse(
            spotifyId = cacheEntry.spotifyId,
            appleMusicId = cacheEntry.appleMusicId,
            appleMusicUrl = cacheEntry.appleMusicUrl,
            bandcampId = cacheEntry.bandcampUrl,
            bandcampUrl = cacheEntry.bandcampUrl
        )
    }

    // TODO: possibly move this to a new service
    fun getOrCreateSong(source: ItemSource, key: String, currentUser: User): SongWithMeta {
        val existingSong = songDao.getSongBySource(source, key, currentUser.id)

        if (existingSong != null) {
            return existingSong
        }

        val cacheEntry = getOrHydrateSongCache(source, key)
            ?: throw NotFoundResponse("Could not find song with source $source and key $key")

        val song = songDao.createSongFromCacheEntry(cacheEntry)
        return SongWithMeta(song, ItemMeta(likeCount = 0, isLiked = false))
    }

    fun getOrCreateAlbum(source: ItemSource, key: String, currentUser: User): Album {
        val existingAlbum = albumDao.getAlbumBySource(source, key, currentUserId = currentUser.id)

        if (existingAlbum != null) {
            return existingAlbum
        }

        val cacheEntry = getOrHydrateAlbumCache(source, key)
            ?: throw NotFoundResponse("Could not find album with source $source and key $key")

        return albumDao.createAlbumFromCacheEntry(cacheEntry)
    }

    // TODO: Everything here could be pulled into a utility class, probably?

    private fun createSearchCacheFromSpotifyTrack(track: Track): SongSearchCache {
        val isrc = track.externalIds.externalIds["isrc"]
        val cacheEntry = SongSearchCache(
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
        searchCacheDao.setTrackSearchCache(ItemSource.SPOTIFY, track.id, cacheEntry)
        return cacheEntry
    }

    private fun createSearchCacheFromBandcampSong(song: BandcampSong): SongSearchCache {
        val cacheEntry = SongSearchCache(
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
        searchCacheDao.setTrackSearchCache(ItemSource.BANDCAMP, song.bandcampUrl, cacheEntry)
        return cacheEntry
    }

    private fun createSearchCacheFromSpotifyAlbum(
        title: String,
        artists: Array<SpotifyArtist>,
        images: Array<SpotifyImage>,
        id: String
    ): AlbumSearchCache {
        val cacheEntry = AlbumSearchCache(
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
        searchCacheDao.setAlbumSearchCache(ItemSource.SPOTIFY, id, cacheEntry)
        return cacheEntry
    }

    private fun createSearchCacheFromBandcampAlbum(album: BandcampAlbum): AlbumSearchCache {
        val cacheEntry = AlbumSearchCache(
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
        searchCacheDao.setAlbumSearchCache(ItemSource.BANDCAMP, album.bandcampUrl, cacheEntry)
        return cacheEntry
    }

    private fun findAndCacheSong(source: ItemSource, key: String): SongSearchCache? {
        return when (source) {
            ItemSource.SPOTIFY -> {
                val track = spotifyApiService.getTrackById(key)
                    ?: return null
                createSearchCacheFromSpotifyTrack(track)
            }
            ItemSource.BANDCAMP -> {
                val song = bandcampService.getSongByUrl(key)
                    ?: return null
                createSearchCacheFromBandcampSong(song)
            }
        }
    }

    private fun findAndCacheAlbum(source: ItemSource, key: String): AlbumSearchCache? {
        return when (source) {
            ItemSource.SPOTIFY -> {
                val album = spotifyApiService.getAlbumById(key)
                    ?: return null
                createSearchCacheFromSpotifyAlbum(album.name, album.artists, album.images, album.id)
            }
            ItemSource.BANDCAMP -> {
                val album = bandcampService.getAlbumByUrl(key)
                    ?: return null
                createSearchCacheFromBandcampAlbum(album)
            }
        }
    }

    private fun hydrateSpotifySong(cacheEntry: SongSearchCache): SongSearchCache {
        val isrc = cacheEntry.isrc

        if (isrc != null) {
            val song = spotifyApiService.searchTracks("isrc:$isrc").getOrNull(0)
            if (song != null) {
                return cacheEntry.copy(
                    searchedSpotify = true,
                    spotifyId = song.id
                )
            }
        }

        // TODO: find from other criteria

        return cacheEntry.copy(searchedSpotify = true)
    }

    private fun hydrateAppleMusicSong(cacheEntry: SongSearchCache): SongSearchCache {
        val isrc = cacheEntry.isrc

        if (disableAppleMusic) {
            return cacheEntry.copy(searchedAppleMusic = true)
        }

        if (isrc != null) {
            val song = appleMusicService.getSongDetailsByIsrc(isrc)
            if (song != null) {
                return cacheEntry.copy(
                    searchedAppleMusic = true,
                    appleMusicId = song.id,
                    appleMusicUrl = song.attributes.url
                )
            }
        }

        // TODO: find from other criteria

        return cacheEntry.copy(searchedAppleMusic = true)
    }

    private fun hydrateSpotifyAlbum(cacheEntry: AlbumSearchCache): AlbumSearchCache {
        val spotifyDetails = spotifyApiService.getAlbumByExistingDetails(cacheEntry)
            ?: return cacheEntry.copy(searchedSpotify = true)

        // spotify is "most accurate" source of truth for details rn
        // this will matter when we start doing e.g. splitting bandcamp artists
        return cacheEntry.copy(
            searchedSpotify = true,
            title = spotifyDetails.name,
            artists = spotifyDetails.artists.map { it.name },
            albumArt = spotifyDetails.images[0].url,
            spotifyId = spotifyDetails.id
        )
    }

    private fun hydrateAppleMusicAlbum(cacheEntry: AlbumSearchCache): AlbumSearchCache {
        val appleMusicDetails = appleMusicService.getAlbumByExistingDetails(cacheEntry)
            ?: return cacheEntry.copy(searchedAppleMusic = true)

        return cacheEntry.copy(
            searchedAppleMusic = true,
            appleMusicId = appleMusicDetails.id,
            appleMusicUrl = appleMusicDetails.attributes.url
        )
    }

    private fun getOrHydrateSongCache(source: ItemSource, key: String): SongSearchCache? {
        // TODO: if song is already in database, use that
        var cacheEntry = searchCacheDao.getTrackSearchCache(source, key)

        if (cacheEntry == null) {
            // cache entry disappeared, go find it!
            cacheEntry = findAndCacheSong(source, key)
                ?: return null
        }

        if (!cacheEntry.searchedSpotify) {
            cacheEntry = hydrateSpotifySong(cacheEntry)
        }
        if (!cacheEntry.searchedAppleMusic) {
            cacheEntry = hydrateAppleMusicSong(cacheEntry)
        }

        // TODO: bandcamp cross-search
        // if (!cacheEntry.searchedBandcamp) {
        // }

        searchCacheDao.setTrackSearchCache(source, key, cacheEntry)
        return cacheEntry
    }

    private fun getOrHydrateAlbumCache(source: ItemSource, key: String): AlbumSearchCache? {
        var cacheEntry = searchCacheDao.getAlbumSearchCache(source, key)

        if (cacheEntry == null) {
            cacheEntry = findAndCacheAlbum(source, key)
                ?: return null
        }

        if (!cacheEntry.searchedSpotify) {
            cacheEntry = hydrateSpotifyAlbum(cacheEntry)
        }
        if (!cacheEntry.searchedAppleMusic) {
            cacheEntry = hydrateAppleMusicAlbum(cacheEntry)
        }

        searchCacheDao.setAlbumSearchCache(source, key, cacheEntry)
        return cacheEntry
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

    private fun serializeSongSearchResult(source: ItemSource, item: SongSearchCache): SongSearchResult {
        return SongSearchResult(
            title = item.title,
            album = item.album,
            artists = item.artists,
            albumArt = item.albumArt,
            source = source,
            key = when (source) {
                ItemSource.BANDCAMP -> item.bandcampUrl!!
                ItemSource.SPOTIFY -> item.spotifyId!!
            }
        )
    }

    private fun serializeAlbumSearchResult(source: ItemSource, item: AlbumSearchCache): AlbumSearchResult {
        return AlbumSearchResult(
            title = item.title,
            artists = item.artists,
            albumArt = item.albumArt,
            source = source,
            key = when (source) {
                ItemSource.BANDCAMP -> item.bandcampUrl!!
                ItemSource.SPOTIFY -> item.spotifyId!!
            }
        )
    }
}
