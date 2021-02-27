package club.jambuds.dao.cache

import club.jambuds.model.cache.SpotifyAlbumSearchCache
import club.jambuds.model.cache.SpotifyTrackSearchCache
import com.google.gson.GsonBuilder
import io.lettuce.core.api.StatefulRedisConnection

class SearchCacheDao(private val redis: StatefulRedisConnection<String, String>) {
    private val gson = GsonBuilder().create()

    fun getSpotifyTrackSearchCache(spotifyId: String): SpotifyTrackSearchCache? {
        val key = "spotify:track:$spotifyId"
        return getCache(key)
    }

    fun setSpotifyTrackSearchCache(spotifyId: String, cacheEntry: SpotifyTrackSearchCache) {
        val key = "spotify:track:$spotifyId"
        return setCache(key, cacheEntry)
    }

    fun getSpotifyAlbumSearchCache(spotifyId: String): SpotifyAlbumSearchCache? {
        val key = "spotify:album:$spotifyId"
        return getCache(key)
    }

    fun setSpotifyAlbumSearchCache(spotifyId: String, cacheEntry: SpotifyAlbumSearchCache) {
        val key = "spotify:album:$spotifyId"
        return setCache(key, cacheEntry)
    }

    private inline fun <reified T>getCache(key: String): T? {
        val cmd = redis.sync()
        val resp = cmd.get(key)
        return if (resp == null) {
            null
        } else {
            gson.fromJson(resp, T::class.java)
        }
    }

    private fun <T>setCache(key: String, value: T) {
        val cmd = redis.sync()
        cmd.set(key, gson.toJson(value))
        cmd.expire(key, 60 * 60) // 1 hour cache
    }
}
