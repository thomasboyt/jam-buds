package club.jambuds.service

import club.jambuds.clients.TwitterClient
import club.jambuds.clients.TwitterUserObject
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

    open fun getTwitterClient(user: User): TwitterClient {
        check(!disableTwitter) { "tried to call getTwitterClient but Twtter is disabled" }
        check(user.twitterToken != null && user.twitterSecret != null) {
            "cannot get twitter client for user with no attached twitter"
        }

        return createTwitterClient(
            consumerKey,
            consumerSecret,
            user.twitterToken,
            user.twitterSecret
        )
    }

    open fun postTweet(user: User, tweetContent: String) {
        if (disableTwitter) {
            logger.info("Posted tweet: $tweetContent")
            return
        }

        val resp = getTwitterClient(user).postStatus(tweetContent).execute()

        if (!resp.isSuccessful) {
            val code = resp.code()
            val errorBody = resp.errorBody()!!.string()
            logger.error("Failed to send tweet: status $code\n$errorBody")
        }
    }

    open fun getTwitterFriendIds(user: User): List<String> {
        val resp = getTwitterClient(user).getFriendIds().execute()

        if (!resp.isSuccessful) {
            val err = resp.errorBody()?.string()
            logger.error("Failed to fetch twitter friends: status ${resp.code()} \n $err")
            throw InternalServerErrorResponse("Failed to fetch Twitter friends")
        }

        return resp.body()!!.ids
    }

    open fun getTwitterProfiles(
        user: User,
        twitterIds: List<String>
    ): Map<String, TwitterUserObject> {
        val resp = getTwitterClient(user).lookup(userIds = twitterIds).execute()

        if (!resp.isSuccessful) {
            val err = resp.errorBody()?.string()
            logger.error("Failed to fetch twitter avatars: status ${resp.code()} \n $err")
            throw InternalServerErrorResponse("Failed to fetch Twitter avatars")
        }

        return resp.body()!!.map { it.id_str to it }.toMap()
    }
}
