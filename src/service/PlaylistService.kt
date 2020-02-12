package club.jambuds.service

import club.jambuds.dao.MixtapeDao
import club.jambuds.dao.PostDao
import club.jambuds.dao.SongDao
import club.jambuds.model.AggregatedPost
import club.jambuds.model.MixtapePreview
import club.jambuds.model.SongWithMeta
import com.google.gson.annotations.SerializedName
import java.time.Instant

enum class PlaylistEntryType {
    @SerializedName("song")
    SONG,
    @SerializedName("mixtape")
    MIXTAPE
}

// TODO: move somewhere else?
data class PlaylistEntryResource(
    val timestamp: Instant,
    val userNames: List<String>,
    val song: SongWithMeta? = null,
    val mixtape: MixtapePreview? = null,
    val type: PlaylistEntryType
)

data class ListWithLimitResource<T>(
    val items: List<T>,
    val limit: Int
)

private const val DEFAULT_PLAYLIST_LIMIT = 20

class PlaylistService(
    private val postDao: PostDao,
    private val songDao: SongDao,
    private val mixtapeDao: MixtapeDao
) {
    fun getUserFeed(
        currentUserId: Int,
        beforeTimestamp: Instant?,
        afterTimestamp: Instant?,
        limit: Int = DEFAULT_PLAYLIST_LIMIT
    ): ListWithLimitResource<PlaylistEntryResource> {
        val posts = postDao.getAggregatedPostsByUserFeed(
            currentUserId = currentUserId,
            beforeTimestamp = beforeTimestamp,
            afterTimestamp = afterTimestamp,
            limit = limit
        )

        val items = getPlaylistEntriesForPosts(posts, currentUserId)
        return ListWithLimitResource(items = items, limit = limit)
    }

    fun getPublicFeed(
        beforeTimestamp: Instant?,
        afterTimestamp: Instant?,
        currentUserId: Int?,
        limit: Int = DEFAULT_PLAYLIST_LIMIT
    ): ListWithLimitResource<PlaylistEntryResource> {
        val posts = postDao.getPublicAggregatedPosts(
            beforeTimestamp = beforeTimestamp,
            afterTimestamp = afterTimestamp,
            limit = limit
        )

        val items = getPlaylistEntriesForPosts(posts, currentUserId)
        return ListWithLimitResource(items = items, limit = limit)
    }

    private fun getPlaylistEntriesForPosts(
        posts: List<AggregatedPost>,
        currentUserId: Int?
    ): List<PlaylistEntryResource> {
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
                song != null -> PlaylistEntryType.SONG
                mixtape != null -> PlaylistEntryType.MIXTAPE
                else -> throw Error("Could not match post ID to mixtape or song ID")
            }
            PlaylistEntryResource(
                timestamp = it.timestamp,
                userNames = it.userNames,
                song = songsMap[it.songId],
                mixtape = mixtapesMap[it.mixtapeId],
                type = type
            )
        }
    }
}
