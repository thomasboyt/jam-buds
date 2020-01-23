package service

import java.time.Instant

import model.MixtapePreview
import model.SongWithMeta

// TODO: move somewhere else?
data class FeedEntryResource(
    val timestamp: Instant,
    val userNames: List<String>,
    val song: SongWithMeta? = null,
    val mixtape: MixtapePreview? = null
)

private const val DEFAULT_FEED_LIMIT = 20

class FeedService(
    private val postDao: dao.PostDao,
    private val songDao: dao.SongDao,
    private val mixtapeDao: dao.MixtapeDao) {
    fun getPublicFeed(
        beforeTimestamp: Instant?,
        afterTimestamp: Instant?,
        currentUserId: Int?,
        limit: Int = DEFAULT_FEED_LIMIT
    ) : List<FeedEntryResource> {
        val posts = postDao.getPublicAggregatedPosts(
            beforeTimestamp = beforeTimestamp,
            afterTimestamp = afterTimestamp,
            limit = limit
        )

        val songIds = posts.mapNotNull { it.songId }
        val songsMap = if (songIds.isNotEmpty()) {
            val currentUserId = currentUserId ?: -1
            val songsList = songDao.getSongsByIds(songIds, currentUserId)
            songsList.map { it.id to it }.toMap()
        } else {
            emptyMap()
        }

        val mixtapeIds = posts.mapNotNull { it.mixtapeId }
        val mixtapesMap = if (mixtapeIds.isNotEmpty()) {
            val mixtapesList = mixtapeDao.getMixtapesByIds(mixtapeIds)
            mixtapesList.map { it.id to it }.toMap()
        } else {
            emptyMap()
        }

        return posts.map {
            FeedEntryResource(
                timestamp = it.timestamp,
                userNames = it.userNames,
                song = songsMap[it.songId],
                mixtape = mixtapesMap[it.mixtapeId]
            )
        }
    }
}