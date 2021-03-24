package club.jambuds.web

import club.jambuds.AppTest
import club.jambuds.clients.AppleMusicAlbumAttributes
import club.jambuds.clients.AppleMusicAlbumRelationships
import club.jambuds.clients.AppleMusicArtist
import club.jambuds.clients.AppleMusicArtistAttributes
import club.jambuds.clients.AppleMusicArtistRelationship
import club.jambuds.clients.AppleMusicSearchAlbumItem
import club.jambuds.clients.AppleMusicSearchSongItem
import club.jambuds.clients.AppleMusicSongAttributes
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
import com.wrapper.spotify.model_objects.specification.AlbumSimplified
import com.wrapper.spotify.model_objects.specification.ArtistSimplified
import com.wrapper.spotify.model_objects.specification.ExternalId
import com.wrapper.spotify.model_objects.specification.Image
import com.wrapper.spotify.model_objects.specification.Track
import kong.unirest.Unirest
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

class SearchRoutesTest : AppTest() {
    @Test
    fun `GET search - works for songs`() {
        val track = createTrack()
        whenever(mockSpotifyApiService.searchTracks("Hello")).thenReturn(arrayOf(track))

        val expectedResult = SongSearchResult(
            source = ItemSource.SPOTIFY,
            key = "abcde",
            title = "Live Like We're Dancing",
            artists = listOf("Mura Masa", "Georgia"),
            album = "R.Y.C",
            albumArt = "/some/image.jpg"
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
    fun `GET search - works for albums`() {
        val album = createAlbum()
        whenever(mockSpotifyApiService.searchAlbums("Hello")).thenReturn(arrayOf(album))

        val expectedResult = AlbumSearchResult(
            source = ItemSource.SPOTIFY,
            key = "abcde",
            title = "Sound of Silver",
            artists = listOf("LCD Soundsystem"),
            albumArt = "/some/image.jpg"
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
    fun `GET search - works for bandcamp song URLs`() {
        val url = "https://ladygaga.bandcamp.com/track/replay"
        val bandcampSong = BandcampSong(
            title = "Replay",
            artist = "Lady Gaga",
            album = "Chromatica",
            albumArt = "/images/foo.jpg",
            isrc = "abc",
            bandcampUrl = url,
            bandcampId = "abcde",
            bandcampStreamingAvailable = true
        )
        whenever(mockBandcampService.getSongByUrl(url)).thenReturn(bandcampSong)

        val expectedResult = SongSearchResult(
            source = ItemSource.BANDCAMP,
            title = "Replay",
            artists = listOf("Lady Gaga"),
            albumArt = "/images/foo.jpg",
            album = "Chromatica",
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
    fun `GET search - works for bandcamp album URLs`() {
        val url = "https://ladygaga.bandcamp.com/album/chromatica"
        val album = BandcampAlbum(
            title = "Chromatica",
            artist = "Lady Gaga",
            albumArt = "/images/foo.jpg",
            bandcampUrl = url
        )
        whenever(mockBandcampService.getAlbumByUrl(url)).thenReturn(album)

        val expectedResult = AlbumSearchResult(
            source = ItemSource.BANDCAMP,
            title = "Chromatica",
            artists = listOf("Lady Gaga"),
            albumArt = "/images/foo.jpg",
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

    @Test
    fun `GET search - deduplicates songs by ISRC`() {
        val track1 = createTrack("abcdef")
        val track2 = createTrack("abcdef")
        val track3 = createTrack("foo")
        val track4 = createTrack(null)
        val track5 = createTrack(null)

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

    @Test
    fun `GET search-details_songs_(spotifyId) - uses the search cache to skip spotify lookup`() {
        val cacheEntry = TestDataFactories.createPartialSongSearchCacheEntry()
        searchCacheDao.setTrackSearchCache(ItemSource.SPOTIFY, cacheEntry.spotifyId!!, cacheEntry)

        whenever(mockAppleMusicService.getSongDetailsByIsrc(cacheEntry.isrc!!)).thenReturn(
            AppleMusicSearchSongItem(
                id = "hijkl",
                attributes = AppleMusicSongAttributes(url = "asdf", playParams = emptyMap())
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
                artistName = "LCD Soundsystem"
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

    private fun createTrack(externalId: String? = "abcde"): Track {
        return Track.Builder()
            .setId("abcde")
            .setName("Live Like We're Dancing")
            .setArtists(
                ArtistSimplified.Builder().setName("Mura Masa").build(),
                ArtistSimplified.Builder().setName("Georgia").build()
            )
            .setAlbum(
                AlbumSimplified.Builder()
                    .setName("R.Y.C")
                    .setImages(Image.Builder().setUrl("/some/image.jpg").build())
                    .build()
            )
            .setExternalIds(
                ExternalId.Builder().setExternalIds(mapOf("isrc" to externalId)).build()
            )
            .build()
    }

    private fun createAlbum(): AlbumSimplified {
        return AlbumSimplified.Builder()
            .setId("abcde")
            .setName("Sound of Silver")
            .setArtists(
                ArtistSimplified.Builder().setName("LCD Soundsystem").build()
            )
            .setImages(Image.Builder().setUrl("/some/image.jpg").build())
            .build()
    }
}
