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

class FeedService(
    private val postDao: dao.PostDao,
    private val songDao: dao.SongDao,
    private val mixtapeDao: dao.MixtapeDao) {
    fun getPublicFeed(beforeTimestamp: Instant?, afterTimestamp: Instant?) : List<FeedEntryResource> {
        val posts = postDao.getPublicAggregatedPosts(
            beforeTimestamp = beforeTimestamp,
            afterTimestamp = afterTimestamp
        )

        val songIds = posts.mapNotNull { it.songId }
        val songsMap = if (songIds.isNotEmpty()) {
            // TODO: pass current user ID from something
            val songsList = songDao.getSongsByIds(songIds, 8)
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