package club.jambuds.service

import club.jambuds.dao.ColorSchemeDao
import club.jambuds.dao.NotificationsDao
import club.jambuds.dao.UserDao
import club.jambuds.dao.cache.TwitterFollowingCacheDao
import club.jambuds.model.User
import club.jambuds.responses.CurrentUser
import club.jambuds.responses.FeedPlaylistEntry
import club.jambuds.responses.PublicUser
import club.jambuds.responses.TwitterFriendSuggestion
import club.jambuds.responses.UserProfile
import club.jambuds.util.defaultColorScheme
import io.javalin.http.BadRequestResponse

class UserService(
    private val userDao: UserDao,
    private val colorSchemeDao: ColorSchemeDao,
    private val notificationsDao: NotificationsDao,
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

    private fun getUserProfilesByNames(userNames: List<String>): List<UserProfile> {
        if (userNames.isEmpty()) {
            return emptyList()
        }

        val users = userDao.getUsersByNames(userNames)
        return getUserProfileForUsers(users)
    }

    private fun getUserProfileForUser(user: User): UserProfile {
        val colorScheme = colorSchemeDao.getColorSchemeByUserId(user.id)

        return UserProfile(
            id = user.id,
            name = user.name,
            colorScheme = colorScheme ?: defaultColorScheme
        )
    }

    private fun getUserProfileForUsers(users: List<User>): List<UserProfile> {
        val userIds = users.map { it.id }
        val colorSchemes =
            colorSchemeDao.getColorSchemesByUserIds(userIds).map { it.userId to it }.toMap()
        return users.map {
            UserProfile(
                id = it.id,
                name = it.name,
                colorScheme = colorSchemes[it.id] ?: defaultColorScheme
            )
        }
    }

    fun getUnfollowedTwitterUsersForUser(user: User): List<TwitterFriendSuggestion> {
        if (user.twitterName == null) {
            throw BadRequestResponse(
                "Cannot fetch Twitter friends with no attached Twitter account"
            )
        }

        var twitterIds = twitterFollowingCacheDao.getTwitterFollowingCache(user.id)
        if (twitterIds == null) {
            twitterIds = twitterService.getTwitterFriendIds(user)
            twitterFollowingCacheDao.setTwitterFollowingCache(user.id, twitterIds)
        }
        if (twitterIds.isEmpty()) {
            return emptyList()
        }

        val unfollowedUsers = userDao.getUnfollowedUsersByTwitterIds(user.id, twitterIds)
        if (unfollowedUsers.isEmpty()) {
            return emptyList()
        }

        val profiles = getUserProfileForUsers(unfollowedUsers).map { it.id to it }.toMap()
        val twitterProfiles =
            twitterService.getTwitterProfiles(user, unfollowedUsers.map { it.twitterId!! })

        return unfollowedUsers.map {
            val twitterProfile = twitterProfiles[it.twitterId]
                ?: error("no profile found for twitter ID ${it.twitterId}")
            TwitterFriendSuggestion(
                profile = profiles[it.id] ?: error("no profile found for user id ${it.id}"),
                twitterName = twitterProfile.screen_name,
                twitterAvatar = twitterProfile.profile_image_url_https
            )
        }
    }

    fun serializeCurrentUser(currentUser: User): CurrentUser {
        val following = userDao.getFollowingForUserId(currentUser.id)
        val notificationsCount = notificationsDao.getNewNotificationsCount(currentUser.id)

        return CurrentUser(
            id = currentUser.id,
            name = currentUser.name,
            email = currentUser.email,
            showInPublicFeed = currentUser.showInPublicFeed,
            twitterName = currentUser.twitterName,
            following = following.map { PublicUser(id = it.id, name = it.name) },
            unreadNotificationCount = notificationsCount,
            profile = getUserProfileForUser(currentUser)
        )
    }

    fun getFollowingByUserId(userId: Int): List<UserProfile> {
        val users = userDao.getFollowingForUserId(userId)
        val userNames = users.map { it.name }
        return getUserProfilesByNames(userNames)
    }

    fun getFollowersByUserId(userId: Int): List<UserProfile> {
        val users = userDao.getFollowersForUserId(userId)
        val userNames = users.map { it.name }
        return getUserProfilesByNames(userNames)
    }

    fun getUserProfilesFromFeedEntries(
        playlist: PlaylistService.Playlist<FeedPlaylistEntry>
    ): List<UserProfile> {
        val userNames = playlist.items.flatMap { item -> item.posts.map { it.userName } }.distinct()
        return getUserProfilesByNames(userNames)
    }
}
