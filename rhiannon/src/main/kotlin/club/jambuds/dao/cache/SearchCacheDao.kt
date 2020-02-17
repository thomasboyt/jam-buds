package club.jambuds.dao.cache

import club.jambuds.model.cache.SearchCacheEntry
import com.google.gson.GsonBuilder
import io.lettuce.core.api.StatefulRedisConnection

class SearchCacheDao(private val redis: StatefulRedisConnection<String, String>) {
    private val gson = GsonBuilder().create()

    fun getSearchCacheEntry(spotifyId: String): SearchCacheEntry? {
        val cmd = redis.sync()
        val key = getSearchCacheKey(spotifyId)
        val resp = cmd.get(key)
        if (resp == null) {
            return null
        } else {
            return gson.fromJson(resp, SearchCacheEntry::class.java)
        }
    }

    fun setSearchCacheEntry(spotifyId: String, cacheEntry: SearchCacheEntry) {
        val cmd = redis.sync()
        val key = getSearchCacheKey(spotifyId)
        cmd.set(key, gson.toJson(cacheEntry))
        cmd.expire(key, 24 * 60)  // 1 hour cache
    }

    private fun getSearchCacheKey(spotifyId: String): String {
        return "search:$spotifyId"
    }
}
