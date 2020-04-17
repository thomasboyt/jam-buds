package club.jambuds.service

import club.jambuds.dao.FollowingDao
import club.jambuds.dao.NotificationsDao
import club.jambuds.dao.UserDao
import club.jambuds.responses.PublicUser
import io.javalin.http.BadRequestResponse

class FollowingService(
    private val followingDao: FollowingDao,
    private val userDao: UserDao,
    private val notificationsDao: NotificationsDao
) {
    fun followUser(userId: Int, followedUserName: String): PublicUser {
        val followedUser = userDao.getUserByUserName(followedUserName)
            ?: throw BadRequestResponse("No user found with name $followedUserName")
        val followedUserId = followedUser.id

        followingDao.followUser(userId, followedUserId)
        notificationsDao.createFollowingNotification(followedUserId, newFollowerId = userId)

        return PublicUser(
            id = followedUser.id,
            name = followedUser.name
        )
    }

    fun unfollowUser(userId: Int, followedUserName: String) {
        val followedUser = userDao.getUserByUserName(followedUserName)
            ?: throw BadRequestResponse("No user found with name $followedUserName")
        val followedUserId = followedUser.id

        followingDao.unfollowUser(userId, followedUserId)
        notificationsDao.removeFollowingNotification(followedUserId, followerId = userId)
    }
}
