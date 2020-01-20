package service

import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.sqlobject.kotlin.onDemand
import dao.PostDao
import model.AggregatedPost

class FeedService(db: Jdbi) {
    private val dao = db.onDemand<PostDao>()

    fun getPublicFeed() : List<AggregatedPost> {
        return dao.getPublicAggregatedPosts()
    }
}