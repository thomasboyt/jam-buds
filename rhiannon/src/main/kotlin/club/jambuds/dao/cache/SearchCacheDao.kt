package club.jambuds.dao.cache

import club.jambuds.model.cache.AlbumSearchCache
import club.jambuds.model.ItemSource
import club.jambuds.model.cache.SongSearchCache
import com.fasterxml.jackson.databind.DeserializationFeature
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.KotlinModule
import io.lettuce.core.api.StatefulRedisConnection

class SearchCacheDao(private val redis: StatefulRedisConnection<String, String>) {
    private val objectMapper = ObjectMapper().registerModule(KotlinModule())
        .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)

    fun getTrackSearchCache(source: ItemSource, key: String): SongSearchCache? {
        return getCache("$source:track:$key")
    }

    fun setTrackSearchCache(source: ItemSource, key: String, cacheEntry: SongSearchCache) {
        return setCache("$source:track:$key", cacheEntry)
    }

    fun getAlbumSearchCache(source: ItemSource, key: String): AlbumSearchCache? {
        return getCache("$source:album:$key")
    }

    fun setAlbumSearchCache(source: ItemSource, key: String, cacheEntry: AlbumSearchCache) {
        return setCache("$source:album:$key", cacheEntry)
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
