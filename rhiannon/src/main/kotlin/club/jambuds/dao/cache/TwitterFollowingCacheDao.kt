package club.jambuds.dao.cache

import io.lettuce.core.api.StatefulRedisConnection

class TwitterFollowingCacheDao(private val redis: StatefulRedisConnection<String, String>) {
    fun setTwitterFollowingCache(userId: Int, twitterIds: List<String>) {
        val cmd = redis.sync()
        val key = getKey(userId)
        cmd.sadd(key, *twitterIds.toTypedArray())
        cmd.expire(key, 15 * 60) // 15 minute cache
    }

    fun getTwitterFollowingCache(userId: Int): List<String>? {
        val cmd = redis.sync()
        val key = getKey(userId)
        if (cmd.exists(key) == 0L) {
            return null
        }
        return cmd.smembers(key).toList()
    }

    private fun getKey(userId: Int): String {
        return "twitter_friends:$userId"
    }
}
