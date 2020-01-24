package service

import com.google.gson.annotations.SerializedName
import java.time.Instant

import model.AggregatedPost
import model.MixtapePreview
import model.SongWithMeta

enum class FeedEntryType {
    @SerializedName("song")
    SONG,
    @SerializedName("mixtape")
    MIXTAPE
}

// TODO: move somewhere else?
data class FeedEntryResource(
    val timestamp: Instant,
    val userNames: List<String>,
    val song: SongWithMeta? = null,
    val mixtape: MixtapePreview? = null,
    val type: FeedEntryType
)

data class ListWithLimitResource<T>(
    val items: List<T>,
    val limit: Int
)

private const val DEFAULT_FEED_LIMIT = 20

class FeedService(
    private val postDao: dao.PostDao,
    private val songDao: dao.SongDao,
    private val mixtapeDao: dao.MixtapeDao) {

    fun getUserFeed(
        currentUserId: Int,
        beforeTimestamp: Instant?,
        afterTimestamp: Instant?,
        limit: Int = DEFAULT_FEED_LIMIT
    ) : ListWithLimitResource<FeedEntryResource> {
        val posts = postDao.getAggregatedPostsByUserFeed(
            currentUserId = currentUserId,
            beforeTimestamp = beforeTimestamp,
            afterTimestamp = afterTimestamp,
            limit = limit
        )

        val items = getFeedEntriesForPosts(posts, currentUserId)
        return ListWithLimitResource(items = items, limit = limit)
    }

    fun getPublicFeed(
        beforeTimestamp: Instant?,
        afterTimestamp: Instant?,
        currentUserId: Int?,
        limit: Int = DEFAULT_FEED_LIMIT
    ) : ListWithLimitResource<FeedEntryResource> {
        val posts = postDao.getPublicAggregatedPosts(
            beforeTimestamp = beforeTimestamp,
            afterTimestamp = afterTimestamp,
            limit = limit
        )

        val items = getFeedEntriesForPosts(posts, currentUserId)
        return ListWithLimitResource(items = items, limit = limit)
    }

    private fun getFeedEntriesForPosts(
        posts: List<AggregatedPost>,
        currentUserId: Int?
    ) : List<FeedEntryResource> {
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
            val song = songsMap[it.songId]
            val mixtape = mixtapesMap[it.mixtapeId]
            val type = when {
                song != null -> FeedEntryType.SONG
                mixtape != null -> FeedEntryType.MIXTAPE
                else -> throw Error("Could not match post ID to mixtape or song ID")
            }
            FeedEntryResource(
                timestamp = it.timestamp,
                userNames = it.userNames,
                song = songsMap[it.songId],
                mixtape = mixtapesMap[it.mixtapeId],
                type = type
            )
        }
    }
}