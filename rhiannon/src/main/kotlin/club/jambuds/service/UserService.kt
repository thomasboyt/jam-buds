package club.jambuds.service

import club.jambuds.dao.ColorSchemeDao
import club.jambuds.dao.UserDao
import club.jambuds.dao.cache.TwitterFollowingCacheDao
import club.jambuds.model.User
import club.jambuds.responses.PublicUserWithTwitterName
import club.jambuds.responses.UserProfile
import io.javalin.http.BadRequestResponse

class UserService(
    private val userDao: UserDao,
    private val colorSchemeDao: ColorSchemeDao,
    private val twitterService: TwitterService,
    private val twitterFollowingCacheDao: TwitterFollowingCacheDao
) {
    fun getUserProfileByName(userName: String): UserProfile? {
        val user = userDao.getUserByUserName(userName) ?: return null
        return getUserProfileForUser(user)
    }

    fun getUserProfileByUserId(userId: Int): UserProfile? {
        val user = userDao.getUserByUserId(userId) ?: return null
        return getUserProfileForUser(user)
    }

    private fun getUserProfileForUser(user: User): UserProfile {
        val colorScheme = colorSchemeDao.getColorSchemeByUserId(user.id)

        return UserProfile(
            id = user.id,
            name = user.name,
            colorScheme = colorScheme
        )
    }

    fun getUnfollowedTwitterUsersForUser(user: User): List<PublicUserWithTwitterName> {
        if (user.twitterName == null) {
            throw BadRequestResponse("Cannot fetch Twitter friends with no attached Twitter account")
        }

        var twitterIds = twitterFollowingCacheDao.getTwitterFollowingCache(user.id)
        if (twitterIds == null) {
            twitterIds = twitterService.getTwitterFriendIds(user)
            twitterFollowingCacheDao.setTwitterFollowingCache(user.id, twitterIds)
        }

        val unfollowedUsers = if (twitterIds.isNotEmpty()) {
            userDao.getUnfollowedUsersByTwitterIds(user.id, twitterIds)
        } else {
            emptyList()
        }

        return unfollowedUsers.map {
            PublicUserWithTwitterName(
                id = it.id,
                name = it.name,
                twitterName = it.twitterName!!
            )
        }
    }
}
