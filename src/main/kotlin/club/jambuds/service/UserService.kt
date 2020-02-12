package club.jambuds.service

import club.jambuds.dao.UserDao
import club.jambuds.responses.UserProfile

class UserService(private val userDao: UserDao) {
    fun getUserProfileByName(userName: String): UserProfile? {
        val user = userDao.getUserByUserName(userName) ?: return null

        return UserProfile(
            id = user.id,
            name = user.name
            // TODO: load color scheme
        )
    }
}
