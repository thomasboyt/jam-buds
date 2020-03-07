package club.jambuds.service

import club.jambuds.clients.createTwitterClient
import club.jambuds.model.User
import io.javalin.http.InternalServerErrorResponse
import org.slf4j.LoggerFactory

open class TwitterService(
    private val consumerKey: String,
    private val consumerSecret: String,
    private val disableTwitter: Boolean = false
) {
    private val logger = LoggerFactory.getLogger(TwitterService::class.java.name)

    open fun postTweet(user: User, tweetContent: String) {
        check(!disableTwitter) { "tried to call postTweet but Twtter is disabled" }
        check(user.twitterToken != null && user.twitterSecret != null) {
            "cannot post tweet for user with no attached twitter"
        }

        val twitterClient =
            createTwitterClient(consumerKey, consumerSecret, user.twitterToken, user.twitterSecret)

        val resp = twitterClient.postStatus(tweetContent).execute()

        if (!resp.isSuccessful) {
            logger.error("Failed to send tweet: status ${resp.code()} \n ${resp.errorBody()!!.string()}")
        }
    }

    /**
     * TODO: cache Twitter friends in Redis
     */
    open fun getTwitterFriendIds(user: User): List<String> {
        check(!disableTwitter) { "tried to call getTwitterFriendIds but Twtter is disabled" }
        check(user.twitterToken != null && user.twitterSecret != null) {
            "cannot get twitter friends for user with no twitter attached"
        }

        // TODO: make this possible to stub
        val twitterClient =
            createTwitterClient(consumerKey, consumerSecret, user.twitterToken, user.twitterSecret)

        val resp = twitterClient.getFriendIds().execute()

        if (!resp.isSuccessful) {
            val err = resp.errorBody()?.string()
            logger.error("Failed to fetch twitter friends: status ${resp.code()} \n $err")
            throw InternalServerErrorResponse("Failed to fetch Twitter friends")
        }

        return resp.body()!!.ids
    }
}
