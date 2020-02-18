package club.jambuds.service

import club.jambuds.clients.createTwitterClient
import club.jambuds.model.User
import org.slf4j.LoggerFactory

open class TwitterService(
    private val consumerKey: String,
    private val consumerSecret: String,
    private val disableTwitter: Boolean = false
) {
    private val logger = LoggerFactory.getLogger(TwitterService::class.java.name)

    open fun postTweet(user: User, tweetContent: String) {
        check(!disableTwitter) { "tried to call postTweet but Twtter is disabled" }

        val token = user.twitterToken
        val secret = user.twitterSecret

        check(token != null && secret != null) {
            "Cannot post tweet for user who has not authorized with twitter"
        }

        val twitterClient = createTwitterClient(consumerKey, consumerSecret, token, secret)

        val resp = twitterClient.postStatus(tweetContent).execute()

        if (!resp.isSuccessful) {
            logger.error("Failed to send tweet: status ${resp.code()} \n ${resp.errorBody()!!.string()}")
        }
    }
}
