package club.jambuds.service

import club.jambuds.dao.FollowingDao
import club.jambuds.dao.NotificationsDao
import club.jambuds.dao.UserDao
import club.jambuds.model.NotificationType
import club.jambuds.model.User
import club.jambuds.responses.PublicUser
import io.javalin.http.BadRequestResponse

class FollowingService(
    private val followingDao: FollowingDao,
    private val userDao: UserDao,
    private val notificationsDao: NotificationsDao
) {
    fun followUser(currentUser: User, followedUserName: String): PublicUser {
        val followedUser = userDao.getUserByUserName(followedUserName)
            ?: throw BadRequestResponse("No user found with name $followedUserName")
        val followedUserId = followedUser.id

        followingDao.followUser(currentUser.id, followedUserId)
        notificationsDao.createNotification(
            targetUserId = followedUserId,
            type = NotificationType.FOLLOW,
            key = getFollowNotificationKey(currentUser),
            body = "${currentUser.name} is now following you!",
            url = "/users/${currentUser.name}"
        )

        return PublicUser(
            id = followedUser.id,
            name = followedUser.name
        )
    }

    fun unfollowUser(currentUser: User, followedUserName: String) {
        val followedUser = userDao.getUserByUserName(followedUserName)
            ?: throw BadRequestResponse("No user found with name $followedUserName")
        val followedUserId = followedUser.id

        followingDao.unfollowUser(currentUser.id, followedUserId)
        notificationsDao.removeNotification(
            targetUserId = followedUserId,
            type = NotificationType.FOLLOW,
            key = getFollowNotificationKey(currentUser)
        )
    }

    private fun getFollowNotificationKey(currentUser: User): String {
        return "follower:${currentUser.id}"
    }
}
