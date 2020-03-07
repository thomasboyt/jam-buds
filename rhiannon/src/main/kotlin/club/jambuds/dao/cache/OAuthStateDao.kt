package club.jambuds.dao.cache

import club.jambuds.util.generateRandomString
import io.lettuce.core.api.StatefulRedisConnection

class OAuthStateDao(private val redis: StatefulRedisConnection<String, String>) {
    fun createStateToken(redirectPath: String): String {
        val token = generateRandomString(32)
        val cmd = redis.sync()
        val key = getStateKey(token)
        cmd.set(key, redirectPath)
        cmd.expire(key, 15 * 60)  // 15 minute cache
        return token
    }

    fun getRedirectPathForStateToken(stateToken: String): String? {
        val cmd = redis.sync()
        val key = getStateKey(stateToken)
        return cmd.get(key)
    }

    private fun getStateKey(stateToken: String): String {
        return "oauthState:$stateToken"
    }
}
