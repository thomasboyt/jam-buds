package club.jambuds.web

import club.jambuds.AppTest
import club.jambuds.getGson
import club.jambuds.responses.SpotifySearchResponse
import club.jambuds.responses.SpotifySearchResult
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
    fun `GET spotify-search - works`() {
        val track = createTrack()

        whenever(mockSpotifyApiService.search("Hello")).thenReturn(arrayOf(track))

        val expectedResult = SpotifySearchResult(
            spotifyId = "abcde",
            title = "Live Like We're Dancing",
            artists = listOf("Mura Masa", "Georgia"),
            album = "R.Y.C",
            albumArt = "/some/image.jpg"
        )

        val resp = Unirest.get("$appUrl/spotify-search")
            .queryString("query", "Hello")
            .asString()
        assertEquals(200, resp.status)

        val body = gson.fromJson(resp.body, SpotifySearchResponse::class.java)

        assertEquals(expectedResult, body.songs[0])
    }

    @Test
    fun `GET spotify-search - deduplicates by ISRC`() {
        val track1 = createTrack("abcdef")
        val track2 = createTrack("abcdef")
        val track3 = createTrack("foo")
        val track4 = createTrack(null)
        val track5 = createTrack(null)

        whenever(mockSpotifyApiService.search("Hello")).thenReturn(
            arrayOf(
                track1,
                track2,
                track3,
                track4,
                track5
            )
        )

        val resp = Unirest.get("$appUrl/spotify-search")
            .queryString("query", "Hello")
            .asString()
        assertEquals(200, resp.status)
        val body = gson.fromJson(resp.body, SpotifySearchResponse::class.java)
        assertEquals(4, body.songs.size)
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
