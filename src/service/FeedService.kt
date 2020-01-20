package service

import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.sqlobject.kotlin.onDemand
import dao.PostDao
import model.AggregatedPost
import java.time.LocalDateTime

data class PaginationOptions(
    val limit: Int = 10,
    val beforeTimestamp: LocalDateTime? = null,
    val afterTimestamp: LocalDateTime? = null
)

class FeedService(private val postDao: PostDao) {
    fun getPublicFeed(paginationOptions: PaginationOptions) : List<AggregatedPost> {
        val posts = postDao.getPublicAggregatedPosts()
        return posts
//        val songs = songDao.
    }
}