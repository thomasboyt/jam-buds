package service

import java.time.Instant

import dao.PostDao
import dao.SongDao
import model.SongWithMeta

data class PaginationOptions(
    val limit: Int = 10,
    val beforeTimestamp: Instant? = null,
    val afterTimestamp: Instant? = null
)

// TODO: move somewhere?
data class FeedEntryResource(
    val timestamp: Instant,
    val userNames: List<String>,
    val song: SongWithMeta? = null
//    val mixtapeId: Int? = null
)

class FeedService(private val postDao: PostDao, private val songDao: SongDao) {
    fun getPublicFeed(paginationOptions: PaginationOptions) : List<FeedEntryResource> {
        // TODO: use paginationOptions from route
        val posts = postDao.getPublicAggregatedPosts()
        val songIds = posts.mapNotNull { it.songId }
        val songsList = songDao.getSongsByIds(songIds, 8)  // TODO: pass current user ID from route
        val songsMap = songsList.map { it.id to it }.toMap()
        val feedEntries = posts.map {
            FeedEntryResource(it.timestamp, it.userNames, songsMap[it.songId])
        }
        return feedEntries
    }
}