package club.jambuds.service

import club.jambuds.dao.ColorSchemeDao
import club.jambuds.dao.UserDao
import club.jambuds.model.User
import club.jambuds.responses.UserProfile

class UserService(private val userDao: UserDao, private val colorSchemeDao: ColorSchemeDao) {
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
}
