package club.jambuds.web

import club.jambuds.AppTest
import club.jambuds.clients.AppleMusicSearchSongItem
import club.jambuds.clients.AppleMusicSongAttributes
import club.jambuds.getGson
import club.jambuds.model.cache.SpotifyTrackSearchCache
import club.jambuds.responses.SearchDetailsResponse
import club.jambuds.responses.SpotifySearchResponse
import club.jambuds.responses.SongSearchResult
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
    private val gson = getGson()

    @Test
    fun `GET search - works`() {
        val track = createTrack()

        whenever(mockSpotifyApiService.searchTracks("Hello")).thenReturn(arrayOf(track))

        val expectedResult = SongSearchResult(
            spotifyId = "abcde",
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

        val body = gson.fromJson(resp.body, SpotifySearchResponse::class.java)

        assertEquals(expectedResult, body.songs!![0])
    }

    @Test
    fun `GET search - stores results in song cache`() {
        val track = createTrack()
        whenever(mockSpotifyApiService.searchTracks("Hello")).thenReturn(arrayOf(track))

        val resp = Unirest.get("$appUrl/search")
            .queryString("query", "Hello")
            .queryString("type", "song")
            .asString()
        assertEquals(200, resp.status)

        val cache = searchCacheDao.getSpotifyTrackSearchCache("abcde")
        assertEquals(track.id, cache!!.spotify.id)
        assertEquals("abcde", cache.isrc)
        assertEquals(false, cache.didHydrateExternalIds)
        assertEquals(null, cache.appleMusicId)
        assertEquals(null, cache.appleMusicUrl)
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
        val body = gson.fromJson(resp.body, SpotifySearchResponse::class.java)
        assertEquals(4, body.songs!!.size)
    }

    @Test
    fun `GET search-details_songs_(spotifyId) - uses the search cache to skip spotify lookup`() {
        val track = createTrack()
        val cacheEntry = SpotifyTrackSearchCache(
            spotify = track,
            isrc = "abcde",
            didHydrateExternalIds = false,
            appleMusicUrl = null,
            appleMusicId = null
        )

        searchCacheDao.setSpotifyTrackSearchCache(track.id, cacheEntry)

        whenever(mockAppleMusicService.getSongDetailsByIsrc("abcde")).thenReturn(
            AppleMusicSearchSongItem(
                id = "hijkl",
                attributes = AppleMusicSongAttributes(url = "asdf", playParams = emptyMap())
            )
        )

        val resp = Unirest.get("$appUrl/search-details/songs/abcde")
            .asString()
        assertEquals(200, resp.status)

        val body = gson.fromJson(resp.body, SearchDetailsResponse::class.java)
        assertEquals(track.id, body.spotifyId)
    }

    @Test
    fun `GET search-details_songs_(spotifyId) - uses the search cache to skip apple music lookup`() {
        val track = createTrack()
        val cacheEntry = SpotifyTrackSearchCache(
            spotify = track,
            isrc = "abcde",
            didHydrateExternalIds = true,
            appleMusicUrl = "12345",
            appleMusicId = "12345"
        )

        searchCacheDao.setSpotifyTrackSearchCache(track.id, cacheEntry)

        val resp = Unirest.get("$appUrl/search-details/songs/abcde")
            .asString()
        assertEquals(200, resp.status)

        val body = gson.fromJson(resp.body, SearchDetailsResponse::class.java)
        assertEquals(track.id, body.spotifyId)
        assertEquals("12345", body.appleMusicId)
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
}
