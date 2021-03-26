package club.jambuds.service

import club.jambuds.clients.AppleMusicSearchAlbumItem
import club.jambuds.clients.AppleMusicSearchSongItem
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
import club.jambuds.util.DirectUrlParser
import com.wrapper.spotify.model_objects.specification.Album as SpotifyAlbum
import com.wrapper.spotify.model_objects.specification.AlbumSimplified as SpotifyAlbumSimplified
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
        val urlDetails = DirectUrlParser.parse(query)
        if (urlDetails != null && urlDetails.type == ItemType.SONG) {
            val item = findAndCacheSongByUrl(urlDetails.source, query)
                ?: return emptyList()
            return listOf(serializeSongSearchResult(urlDetails.source, item))
        }

        val results = spotifyApiService.searchTracks(query)
        val tracks = dedupeListByIsrc(results)

        val cacheEntries = tracks.map { track ->
            createSearchCacheFromSpotifyTrack(track)
        }

        return cacheEntries.map { serializeSongSearchResult(ItemSource.SPOTIFY, it) }
    }

    fun searchAlbums(query: String): List<AlbumSearchResult> {
        val urlDetails = DirectUrlParser.parse(query)
        if (urlDetails != null && urlDetails.type == ItemType.ALBUM) {
            val item = findAndCacheAlbumByUrl(urlDetails.source, query)
                ?: return emptyList()
            return listOf(serializeAlbumSearchResult(urlDetails.source, item))
        }

        val results = spotifyApiService.searchAlbums(query)
        val cacheEntries = results.map { album ->
            createSearchCacheFromSpotifyAlbumSimplified(album)
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
        val cacheEntry = SongSearchCache.fromSpotify(track)
        searchCacheDao.setTrackSearchCache(ItemSource.SPOTIFY, track.id, cacheEntry)
        return cacheEntry
    }

    private fun createSearchCacheFromAppleMusicSong(song: AppleMusicSearchSongItem): SongSearchCache {
        val cacheEntry = SongSearchCache.fromAppleMusic(song)
        searchCacheDao.setTrackSearchCache(ItemSource.APPLEMUSIC, song.id, cacheEntry)
        return cacheEntry
    }

    private fun createSearchCacheFromBandcampSong(song: BandcampSong): SongSearchCache {
        val cacheEntry = SongSearchCache.fromBandcamp(song)
        searchCacheDao.setTrackSearchCache(ItemSource.BANDCAMP, song.bandcampUrl, cacheEntry)
        return cacheEntry
    }

    private fun createSearchCacheFromSpotifyAlbum(album: SpotifyAlbum): AlbumSearchCache {
        val cacheEntry = AlbumSearchCache.fromSpotifyFull(album)
        searchCacheDao.setAlbumSearchCache(ItemSource.SPOTIFY, album.id, cacheEntry)
        return cacheEntry
    }

    private fun createSearchCacheFromSpotifyAlbumSimplified(album: SpotifyAlbumSimplified): AlbumSearchCache {
        val cacheEntry = AlbumSearchCache.fromSpotifySimplified(album)
        searchCacheDao.setAlbumSearchCache(ItemSource.SPOTIFY, album.id, cacheEntry)
        return cacheEntry
    }

    private fun createSearchCacheFromAppleMusicAlbum(album: AppleMusicSearchAlbumItem): AlbumSearchCache {
        val cacheEntry = AlbumSearchCache.fromAppleMusic(album)
        searchCacheDao.setAlbumSearchCache(ItemSource.APPLEMUSIC, album.id, cacheEntry)
        return cacheEntry
    }

    private fun createSearchCacheFromBandcampAlbum(album: BandcampAlbum): AlbumSearchCache {
        val cacheEntry = AlbumSearchCache.fromBandcamp(album)
        searchCacheDao.setAlbumSearchCache(ItemSource.BANDCAMP, album.bandcampUrl, cacheEntry)
        return cacheEntry
    }

    private fun findAndCacheSongByKey(source: ItemSource, key: String): SongSearchCache? {
        return when (source) {
            ItemSource.SPOTIFY -> {
                val track = spotifyApiService.getTrackById(key)
                    ?: return null
                createSearchCacheFromSpotifyTrack(track)
            }
            ItemSource.APPLEMUSIC -> {
                val song = appleMusicService.getSongDetailsById(key)
                    ?: return null
                createSearchCacheFromAppleMusicSong(song)
            }
            ItemSource.BANDCAMP -> {
                val song = bandcampService.getSongByUrl(key)
                    ?: return null
                createSearchCacheFromBandcampSong(song)
            }
        }
    }

    private fun findAndCacheSongByUrl(source: ItemSource, url: String): SongSearchCache? {
        return when (source) {
            ItemSource.SPOTIFY -> {
                val id = DirectUrlParser.spotifyUrlId(url)
                findAndCacheSongByKey(source, id!!)
            }
            ItemSource.APPLEMUSIC -> {
                val id = DirectUrlParser.appleMusicUrlSongId(url)
                findAndCacheSongByKey(source, id!!)
            }
            ItemSource.BANDCAMP -> {
                findAndCacheSongByKey(source, url)
            }
        }
    }

    private fun findAndCacheAlbumByKey(source: ItemSource, key: String): AlbumSearchCache? {
        return when (source) {
            ItemSource.SPOTIFY -> {
                val album = spotifyApiService.getAlbumById(key)
                    ?: return null
                createSearchCacheFromSpotifyAlbum(album)
            }
            ItemSource.APPLEMUSIC -> {
                val song = appleMusicService.getAlbumById(key)
                    ?: return null
                createSearchCacheFromAppleMusicAlbum(song)
            }
            ItemSource.BANDCAMP -> {
                // note - bandcamp uses url as key, not ID
                val album = bandcampService.getAlbumByUrl(key)
                    ?: return null
                createSearchCacheFromBandcampAlbum(album)
            }
        }
    }

    private fun findAndCacheAlbumByUrl(source: ItemSource, url: String): AlbumSearchCache? {
        return when (source) {
            ItemSource.SPOTIFY -> {
                val id = DirectUrlParser.spotifyUrlId(url)
                findAndCacheAlbumByKey(source, id!!)
            }
            ItemSource.APPLEMUSIC -> {
                val id = DirectUrlParser.appleMusicUrlAlbumId(url)
                findAndCacheAlbumByKey(source, id!!)
            }
            ItemSource.BANDCAMP -> {
                findAndCacheAlbumByKey(source, url)
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
        if (disableAppleMusic) {
            return cacheEntry.copy(searchedAppleMusic = true)
        }

        val isrc = cacheEntry.isrc
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
        if (disableAppleMusic) {
            return cacheEntry.copy(searchedAppleMusic = true)
        }

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
            cacheEntry = findAndCacheSongByKey(source, key)
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
            cacheEntry = findAndCacheAlbumByKey(source, key)
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
                ItemSource.APPLEMUSIC -> item.appleMusicId!!
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
                ItemSource.APPLEMUSIC -> item.appleMusicId!!
                ItemSource.SPOTIFY -> item.spotifyId!!
            }
        )
    }
}
