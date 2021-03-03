package club.jambuds.dao.cache

import club.jambuds.model.cache.SpotifyAlbumSearchCache
import club.jambuds.model.cache.SpotifyTrackSearchCache
import com.fasterxml.jackson.annotation.JsonInclude
import com.fasterxml.jackson.databind.DeserializationFeature
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.KotlinModule
import io.lettuce.core.api.StatefulRedisConnection

class SearchCacheDao(private val redis: StatefulRedisConnection<String, String>) {
    private val objectMapper = ObjectMapper().registerModule(KotlinModule())
        .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)

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
            objectMapper.readValue(resp, T::class.java)
        }
    }

    private fun <T>setCache(key: String, value: T) {
        val cmd = redis.sync()
        cmd.set(key, objectMapper.writeValueAsString(value))
        cmd.expire(key, 60 * 60) // 1 hour cache
    }
}
