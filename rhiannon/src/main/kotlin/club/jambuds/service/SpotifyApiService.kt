package club.jambuds.service

import club.jambuds.model.cache.AlbumSearchCache
import club.jambuds.util.FuzzySearchLogic
import com.wrapper.spotify.SpotifyApi
import com.wrapper.spotify.exceptions.SpotifyWebApiException
import com.wrapper.spotify.exceptions.detailed.NotFoundException
import com.wrapper.spotify.model_objects.specification.Album
import com.wrapper.spotify.model_objects.specification.AlbumSimplified
import com.wrapper.spotify.model_objects.specification.Track
import org.slf4j.LoggerFactory
import java.io.PrintWriter
import java.io.StringWriter
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit

// left open for mocking
open class SpotifyApiService(clientId: String, clientSecret: String) {
    val itemRegex = Regex("""https?://open\.spotify\.com/(album|track)/([A-z0-9-]+)""")

    private val logger = LoggerFactory.getLogger(SpotifyApiService::class.java.name)

    // TODO: should this use a pool at all?
    private val threadPool = Executors.newScheduledThreadPool(1)

    private val spotifyApi = SpotifyApi.Builder()
        .setClientId(clientId)
        .setClientSecret(clientSecret)
        .build()

    fun startRefreshLoop() {
        threadPool.scheduleAtFixedRate(this::refresh, 0, 5, TimeUnit.MINUTES)
    }

    // TODO: use some kind of retry-with-back-off strategy for failures
    private fun refresh() {
        try {
            val resp = spotifyApi.clientCredentials().build().execute()
            spotifyApi.accessToken = resp.accessToken
            logger.info("Refreshed Spotify token")
        } catch (e: Throwable) {
            val sw = StringWriter()
            val pw = PrintWriter(sw)
            e.printStackTrace(pw)
            logger.error("Exception refreshing Spotify token. StackTrace:\n$sw")
        }
    }

    open fun getTrackById(id: String): Track? {
        return try {
            spotifyApi.getTrack(id).build().execute()
        } catch (err: SpotifyWebApiException) {
            if (err is NotFoundException) {
                null
            } else {
                throw err
            }
        }
    }

    open fun searchTracks(query: String): Array<Track> {
        return spotifyApi.searchTracks(query).build().execute().items
    }

    open fun searchAlbums(query: String): Array<AlbumSimplified> {
        return spotifyApi.searchAlbums(query).build().execute().items
    }

    open fun getAlbumById(id: String): Album? {
        return try {
            spotifyApi.getAlbum(id).build().execute()
        } catch (err: SpotifyWebApiException) {
            if (err is NotFoundException) {
                null
            } else {
                throw err
            }
        }
    }

    open fun getAlbumByExistingDetails(cacheEntry: AlbumSearchCache): AlbumSimplified? {
        val title = cacheEntry.title
        val artistsQuery = cacheEntry.artists.joinToString(" ")

        // strict search
        var results = spotifyApi.searchAlbums("$title $artistsQuery").build().execute().items
        var result = results.find { item ->
            val namesEqual = FuzzySearchLogic.albumTitleMatchExact(
                expected = cacheEntry.title,
                result = item.name
            )
            val artistsEqual = FuzzySearchLogic.artistsMatch(
                expected = cacheEntry.artists,
                result = item.artists.map { it.name }
            )
            namesEqual && artistsEqual
        }

        if (result != null) {
            return result
        }

        // loose search
        val cleanedTitle = FuzzySearchLogic.cleanAlbumTitle(cacheEntry.title)
        results = spotifyApi.searchAlbums("$cleanedTitle $artistsQuery").build().execute().items
        result = results.find { item ->
            val namesEqual = FuzzySearchLogic.albumTitleMatchLoose(
                expected = cleanedTitle,
                result = item.name
            )
            val artistsEqual = FuzzySearchLogic.artistsMatch(
                expected = cacheEntry.artists,
                result = item.artists.map { it.name }
            )
            namesEqual && artistsEqual
        }

        return result
    }
}
