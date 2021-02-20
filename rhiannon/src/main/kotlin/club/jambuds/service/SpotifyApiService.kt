package club.jambuds.service

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
}
