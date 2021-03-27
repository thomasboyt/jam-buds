package club.jambuds.web

import club.jambuds.AppTest
import club.jambuds.clients.AppleMusicAlbumAttributes
import club.jambuds.clients.AppleMusicAlbumRelationships
import club.jambuds.clients.AppleMusicArtist
import club.jambuds.clients.AppleMusicArtistAttributes
import club.jambuds.clients.AppleMusicArtistRelationship
import club.jambuds.clients.AppleMusicArtwork
import club.jambuds.clients.AppleMusicSearchAlbumItem
import club.jambuds.clients.AppleMusicSearchSongItem
import club.jambuds.clients.AppleMusicSongAttributes
import club.jambuds.clients.AppleMusicSongRelationships
import club.jambuds.helpers.TestDataFactories
import club.jambuds.model.ItemSource
import club.jambuds.model.cache.AlbumSearchCache
import club.jambuds.responses.AlbumSearchResult
import club.jambuds.responses.SearchDetailsResponse
import club.jambuds.responses.SearchResponse
import club.jambuds.responses.SongSearchResult
import club.jambuds.service.BandcampAlbum
import club.jambuds.service.BandcampSong
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.never
import com.nhaarman.mockitokotlin2.times
import com.nhaarman.mockitokotlin2.verify
import com.nhaarman.mockitokotlin2.whenever
import com.wrapper.spotify.model_objects.specification.Album as SpotifyAlbum
import com.wrapper.spotify.model_objects.specification.AlbumSimplified as SpotifyAlbumSimplified
import com.wrapper.spotify.model_objects.specification.ArtistSimplified as SpotifyArtistSimplified
import com.wrapper.spotify.model_objects.specification.ExternalId as ExternalId
import com.wrapper.spotify.model_objects.specification.Image as SpotifyImage
import com.wrapper.spotify.model_objects.specification.Track as SpotifyTrack
import kong.unirest.Unirest
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

class SearchRoutesTest : AppTest() {
    @Test
    fun `GET search - performs a spotify search for songs`() {
        val track = createSpotifyTrack()
        whenever(mockSpotifyApiService.searchTracks("Hello")).thenReturn(arrayOf(track))

        val expectedResult = SongSearchResult(
            source = ItemSource.SPOTIFY,
            key = track.id,
            title = track.name,
            artists = track.artists.map { it.name },
            album = track.album.name,
            albumArt = track.album.images[0].url
        )

        val resp = Unirest.get("$appUrl/search")
            .queryString("query", "Hello")
            .queryString("type", "song")
            .asString()
        assertEquals(200, resp.status)

        val body = objectMapper.readValue(resp.body, SearchResponse::class.java)

        assertEquals(expectedResult, body.songs!![0])

        val cache = searchCacheDao.getTrackSearchCache(ItemSource.SPOTIFY,"abcde")
        assertEquals(track.id, cache!!.spotifyId)
        assertEquals(true, cache.searchedSpotify)
        assertEquals("abcde", cache.isrc)
        assertEquals(false, cache.searchedAppleMusic)
        assertEquals(null, cache.appleMusicId)
        assertEquals(null, cache.appleMusicUrl)
    }

    @Test
    fun `GET search - performs a spotify search for albums`() {
        val album = createSpotifySearchAlbum()
        whenever(mockSpotifyApiService.searchAlbums("Hello")).thenReturn(arrayOf(album))

        val expectedResult = AlbumSearchResult(
            source = ItemSource.SPOTIFY,
            key = album.id,
            title = album.name,
            artists = album.artists.map { it.name },
            albumArt = album.images[0].url
        )

        val resp = Unirest.get("$appUrl/search")
            .queryString("query", "Hello")
            .queryString("type", "album")
            .asString()
        assertEquals(200, resp.status)

        val body = objectMapper.readValue(resp.body, SearchResponse::class.java)

        assertEquals(expectedResult, body.albums!![0])

        val cache = searchCacheDao.getAlbumSearchCache(ItemSource.SPOTIFY, "abcde")
        assertEquals(album.id, cache!!.spotifyId)
        assertEquals(true, cache.searchedSpotify)
        assertEquals(false, cache.searchedAppleMusic)
        assertEquals(null, cache.appleMusicId)
        assertEquals(null, cache.appleMusicUrl)
    }

    @Test
    fun `GET search - deduplicates songs by ISRC`() {
        val track1 = createSpotifyTrack("abcdef")
        val track2 = createSpotifyTrack("abcdef")
        val track3 = createSpotifyTrack("foo")
        val track4 = createSpotifyTrack(null)
        val track5 = createSpotifyTrack(null)

        whenever(mockSpotifyApiService.searchTracks("Hello")).thenReturn(
            arrayOf(
                track1,
                track2,
                track3,
                track4,
                track5
            )
        )

        val resp = Unirest.get("$appUrl/search")
            .queryString("query", "Hello")
            .queryString("type", "song")
            .asString()
        assertEquals(200, resp.status)
        val body = objectMapper.readValue(resp.body, SearchResponse::class.java)
        assertEquals(4, body.songs!!.size)
    }

    // --- Direct URL entry ---

    @Test
    fun `GET search - works for spotify song URLs`() {
        val song = createSpotifyTrack()
        whenever(mockSpotifyApiService.getTrackById(song.id)).thenReturn(song)

        val url = "https://open.spotify.com/track/${song.id}"
        val resp = Unirest.get("$appUrl/search")
            .queryString("query", url)
            .queryString("type", "song")
            .asString()

        val body = objectMapper.readValue(resp.body, SearchResponse::class.java)
        assertEquals(song.id, body.songs!![0].key)
        assertEquals(ItemSource.SPOTIFY, body.songs!![0].source)

        val cache = searchCacheDao.getTrackSearchCache(ItemSource.SPOTIFY, song.id)
        assertEquals(true, cache!!.searchedSpotify)
        assertEquals(false, cache.searchedAppleMusic)
        assertEquals(false, cache.searchedBandcamp)
        assertEquals(song.id, cache.spotifyId)
    }

    @Test
    fun `GET search - works for apple music song URLs`() {
        val song = createAppleMusicSong()
        whenever(mockAppleMusicService.getSongDetailsById(song.id)).thenReturn(song)

        val resp = Unirest.get("$appUrl/search")
            .queryString("query", song.attributes.url)
            .queryString("type", "song")
            .asString()

        val body = objectMapper.readValue(resp.body, SearchResponse::class.java)
        assertEquals(song.id, body.songs!![0].key)
        assertEquals(ItemSource.APPLEMUSIC, body.songs!![0].source)

        val cache = searchCacheDao.getTrackSearchCache(ItemSource.APPLEMUSIC, song.id)
        assertEquals(false, cache!!.searchedSpotify)
        assertEquals(true, cache.searchedAppleMusic)
        assertEquals(false, cache.searchedBandcamp)
        assertEquals(song.id, cache.appleMusicId)
        assertEquals(song.attributes.url, cache.appleMusicUrl)
    }

    @Test
    fun `GET search - works for bandcamp song URLs`() {
        val bandcampSong = createBandcampSong()
        val url = bandcampSong.bandcampUrl
        whenever(mockBandcampService.getSongByUrl(url)).thenReturn(bandcampSong)

        val expectedResult = SongSearchResult(
            source = ItemSource.BANDCAMP,
            title = bandcampSong.title,
            artists = listOf(bandcampSong.artist),
            albumArt = bandcampSong.albumArt,
            album = bandcampSong.album,
            key = url
        )

        val resp = Unirest.get("$appUrl/search")
            .queryString("query", url)
            .queryString("type", "song")
            .asString()

        val body = objectMapper.readValue(resp.body, SearchResponse::class.java)
        assertEquals(expectedResult, body.songs!![0])

        val cache = searchCacheDao.getTrackSearchCache(ItemSource.BANDCAMP, url)
        assertEquals(url, cache!!.bandcampUrl)
        assertEquals(true, cache.searchedBandcamp)
        assertEquals(false, cache.searchedSpotify)
        assertEquals(false, cache.searchedAppleMusic)
    }

    @Test
    fun `GET search - works for spotify album URLs`() {
        val album = createSpotifySingleAlbum()
        whenever(mockSpotifyApiService.getAlbumById(album.id)).thenReturn(album)

        val url = "https://open.spotify.com/album/${album.id}"
        val resp = Unirest.get("$appUrl/search")
            .queryString("query", url)
            .queryString("type", "album")
            .asString()

        val body = objectMapper.readValue(resp.body, SearchResponse::class.java)
        assertEquals(album.id, body.albums!![0].key)
        assertEquals(ItemSource.SPOTIFY, body.albums!![0].source)

        val cache = searchCacheDao.getAlbumSearchCache(ItemSource.SPOTIFY, album.id)
        assertEquals(true, cache!!.searchedSpotify)
        assertEquals(false, cache.searchedAppleMusic)
        assertEquals(false, cache.searchedBandcamp)
        assertEquals(album.id, cache.spotifyId)
    }

    @Test
    fun `GET search - works for apple music album URLs`() {
        val album = createAppleMusicAlbum()
        whenever(mockAppleMusicService.getAlbumById(album.id)).thenReturn(album)

        val resp = Unirest.get("$appUrl/search")
            .queryString("query", album.attributes.url)
            .queryString("type", "album")
            .asString()

        val body = objectMapper.readValue(resp.body, SearchResponse::class.java)
        assertEquals(album.id, body.albums!![0].key)
        assertEquals(ItemSource.APPLEMUSIC, body.albums!![0].source)

        val cache = searchCacheDao.getAlbumSearchCache(ItemSource.APPLEMUSIC, album.id)
        assertEquals(false, cache!!.searchedSpotify)
        assertEquals(true, cache.searchedAppleMusic)
        assertEquals(false, cache.searchedBandcamp)
        assertEquals(album.id, cache.appleMusicId)
        assertEquals(album.attributes.url, cache.appleMusicUrl)
    }

    @Test
    fun `GET search - works for bandcamp album URLs`() {
        val bandcampAlbum = createBandcampAlbum()
        val url = bandcampAlbum.bandcampUrl
        whenever(mockBandcampService.getAlbumByUrl(url)).thenReturn(bandcampAlbum)

        val expectedResult = AlbumSearchResult(
            source = ItemSource.BANDCAMP,
            title = bandcampAlbum.title,
            artists = listOf(bandcampAlbum.artist),
            albumArt = bandcampAlbum.albumArt,
            key = url
        )

        val resp = Unirest.get("$appUrl/search")
            .queryString("query", url)
            .queryString("type", "album")
            .asString()

        val body = objectMapper.readValue(resp.body, SearchResponse::class.java)
        assertEquals(expectedResult, body.albums!![0])

        val cache = searchCacheDao.getAlbumSearchCache(ItemSource.BANDCAMP, url)
        assertEquals(url, cache!!.bandcampUrl)
        assertEquals(true, cache.searchedBandcamp)
        assertEquals(false, cache.searchedSpotify)
        assertEquals(false, cache.searchedAppleMusic)
    }

    // --- search details ---

    @Test
    fun `GET search-details_songs_(spotifyId) - uses the search cache to skip spotify lookup`() {
        val cacheEntry = TestDataFactories.createPartialSongSearchCacheEntry()
        searchCacheDao.setTrackSearchCache(ItemSource.SPOTIFY, cacheEntry.spotifyId!!, cacheEntry)

        whenever(mockAppleMusicService.getSongDetailsByIsrc(cacheEntry.isrc!!)).thenReturn(
            AppleMusicSearchSongItem(
                id = "hijkl",
                attributes = AppleMusicSongAttributes(
                    url = "asdf",
                    playParams = emptyMap(),
                    isrc = "zxcv",
                    albumName = "zxcv",
                    artwork = AppleMusicArtwork(url = "asdf"),
                    name = "asdf"
                ),
                relationships = AppleMusicSongRelationships(
                    artists = AppleMusicArtistRelationship(listOf())
                )
            )
        )

        val resp = Unirest.get("$appUrl/search-details/songs")
            .queryString("source", ItemSource.SPOTIFY)
            .queryString("key", cacheEntry.spotifyId!!)
            .asString()
        assertEquals(200, resp.status)

        val body = objectMapper.readValue(resp.body, SearchDetailsResponse::class.java)
        assertEquals(cacheEntry.spotifyId, body.spotifyId)
        assertEquals("hijkl", body.appleMusicId)
    }

    @Test
    fun `GET search-details_songs_(spotifyId) - uses the search cache to skip apple music lookup`() {
        val cacheEntry = TestDataFactories.createFullSongSearchCacheEntry()
        searchCacheDao.setTrackSearchCache(ItemSource.SPOTIFY, cacheEntry.spotifyId!!, cacheEntry)

        val resp = Unirest.get("$appUrl/search-details/songs")
            .queryString("source", ItemSource.SPOTIFY)
            .queryString("key", cacheEntry.spotifyId!!)
            .asString()
        assertEquals(200, resp.status)

        val body = objectMapper.readValue(resp.body, SearchDetailsResponse::class.java)
        assertEquals(cacheEntry.spotifyId, body.spotifyId)
        assertEquals(cacheEntry.appleMusicId, body.appleMusicId)
    }

    @Test
    fun `GET search-details_songs_(spotifyId) - uses the search cache to skip bandcamp lookup`() {
        val cacheEntry = TestDataFactories.createBandcampSongSearchCacheEntry()
        searchCacheDao.setTrackSearchCache(ItemSource.BANDCAMP, cacheEntry.bandcampUrl!!, cacheEntry)

        whenever(mockSpotifyApiService.searchTracks(any())).thenReturn(emptyArray())
        whenever(mockAppleMusicService.getSongDetailsByIsrc(any())).thenReturn(null)

        val resp = Unirest.get("$appUrl/search-details/songs")
            .queryString("source", ItemSource.BANDCAMP)
            .queryString("key", cacheEntry.bandcampUrl)
            .asString()
        assertEquals(200, resp.status)

        verify(mockSpotifyApiService, times(1)).searchTracks(any())
        verify(mockAppleMusicService, times(1)).getSongDetailsByIsrc(any())
        verify(mockBandcampService, never()).getSongByUrl(any())

        val body = objectMapper.readValue(resp.body, SearchDetailsResponse::class.java)
        assertEquals(cacheEntry.bandcampId, body.bandcampId)
    }

    @Test
    fun `GET search-details_albums_(spotifyId) - uses the search cache to skip spotify lookup and finds on apple music`() {
        val cacheEntry = AlbumSearchCache(
            title = "Sound of Silver",
            artists = listOf("LCD Soundsystem"),
            albumArt = "/some/image.jpg",
            searchedSpotify = true,
            spotifyId = "abcde",
            searchedAppleMusic = false,
            appleMusicUrl = null,
            appleMusicId = null,
            searchedBandcamp = false,
            bandcampUrl = null
        )

        searchCacheDao.setAlbumSearchCache(ItemSource.SPOTIFY, cacheEntry.spotifyId!!, cacheEntry)

        val mockAlbum = AppleMusicSearchAlbumItem(
            id = "hijkl",
            attributes = AppleMusicAlbumAttributes(
                url = "asdf",
                playParams = emptyMap(),
                name = "Sound of Silver",
                artistName = "LCD Soundsystem",
                artwork = AppleMusicArtwork(url = "/some/image.jpg")
            ),
            relationships = AppleMusicAlbumRelationships(
                AppleMusicArtistRelationship(
                    listOf(
                        AppleMusicArtist(AppleMusicArtistAttributes("LCD Soundsystem"))
                    )
                )
            )
        )

        whenever(mockAppleMusicService.getAlbumByExistingDetails(any())).thenReturn(mockAlbum)

        val resp = Unirest.get("$appUrl/search-details/albums")
            .queryString("source", ItemSource.SPOTIFY)
            .queryString("key", "abcde")
            .asString()
        assertEquals(200, resp.status)

        val body = objectMapper.readValue(resp.body, SearchDetailsResponse::class.java)
        assertEquals(cacheEntry.spotifyId, body.spotifyId)
        assertEquals("hijkl", body.appleMusicId)
    }

    private fun createSpotifyTrack(externalId: String? = "abcde"): SpotifyTrack {
        return SpotifyTrack.Builder()
            .setId("abcde")
            .setName("Live Like We're Dancing")
            .setArtists(
                SpotifyArtistSimplified.Builder().setName("Mura Masa").build(),
                SpotifyArtistSimplified.Builder().setName("Georgia").build()
            )
            .setAlbum(
                SpotifyAlbumSimplified.Builder()
                    .setName("R.Y.C")
                    .setImages(SpotifyImage.Builder().setUrl("/some/image.jpg").build())
                    .build()
            )
            .setExternalIds(
                ExternalId.Builder().setExternalIds(mapOf("isrc" to externalId)).build()
            )
            .build()
    }

    private fun createSpotifySearchAlbum(): SpotifyAlbumSimplified {
        return SpotifyAlbumSimplified.Builder()
            .setId("abcde")
            .setName("Sound of Silver")
            .setArtists(
                SpotifyArtistSimplified.Builder().setName("LCD Soundsystem").build()
            )
            .setImages(SpotifyImage.Builder().setUrl("/some/image.jpg").build())
            .build()
    }

    private fun createSpotifySingleAlbum(): SpotifyAlbum {
        return SpotifyAlbum.Builder()
            .setId("abcde")
            .setName("Sound of Silver")
            .setArtists(
                SpotifyArtistSimplified.Builder().setName("LCD Soundsystem").build()
            )
            .setImages(SpotifyImage.Builder().setUrl("/some/image.jpg").build())
            .build()
    }

    private fun createAppleMusicSong(): AppleMusicSearchSongItem {
        return AppleMusicSearchSongItem(
            id = "1495785693",
            attributes = AppleMusicSongAttributes(
                url = "https://music.apple.com/us/album/r-y-c/1495785666?i=1495785693",
                playParams = mapOf("id" to "1495785693", "kind" to "song"),
                isrc = "GBUM71905139",
                albumName = "R.Y.C",
                artwork = AppleMusicArtwork(url = "https://is3-ssl.mzstatic.com/image/thumb/Music124/v4/de/a5/0a/dea50a81-fb92-0535-ff64-652ddc89fd4a/19UMGIM90187.rgb.jpg/{w}x{h}bb.{f}"),
                name = "Live like We're Dancing"
            ),
            relationships = AppleMusicSongRelationships(
                artists = AppleMusicArtistRelationship(
                    listOf(
                        AppleMusicArtist(AppleMusicArtistAttributes("Mura Masa")),
                        AppleMusicArtist(AppleMusicArtistAttributes("Georgia"))
                    )
                )
            )
        )
    }

    private fun createAppleMusicAlbum(): AppleMusicSearchAlbumItem {
        return AppleMusicSearchAlbumItem(
            id = "742432549",
            attributes = AppleMusicAlbumAttributes(
                name = "Sound of Silver",
                url = "https://music.apple.com/us/album/sound-of-silver/742432549",
                playParams = mapOf("id" to "742432549", "kind" to "album"),
                artwork = AppleMusicArtwork("https://is2-ssl.mzstatic.com/image/thumb/Music124/v4/8f/10/3a/8f103a33-5cc8-53d4-cd2a-7a2af46930ca/094638511359.jpg/{w}x{h}bb.{f}"),
                artistName = "LCD Soundsystem"
            ),
            relationships = AppleMusicAlbumRelationships(
                artists = AppleMusicArtistRelationship(
                    listOf(
                        AppleMusicArtist(AppleMusicArtistAttributes("LCD Soundsystem"))
                    )
                )
            )
        )
    }

    private fun createBandcampSong(): BandcampSong {
        return BandcampSong(
            title = "Alphabet",
            artist = "Shame",
            album = "Drunk Tank Pink",
            albumArt = "https://f4.bcbits.com/img/a1778017841_16.jpg",
            isrc = "USJ5G2120401",
            bandcampId = "2996997764",
            bandcampUrl = "https://shamebanduk.bandcamp.com/track/alphabet-2",
            bandcampStreamingAvailable = true
        )
    }

    private fun createBandcampAlbum(): BandcampAlbum {
        return BandcampAlbum(
            title = "Drunk Tank Pink",
            artist = "Shame",
            albumArt = "https://f4.bcbits.com/img/a1778017841_16.jpg",
            bandcampUrl = "https://shamebanduk.bandcamp.com/album/drunk-tank-pink"
        )
    }
}
