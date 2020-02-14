package club.jambuds.service

import club.jambuds.dao.ColorSchemeDao
import club.jambuds.dao.UserDao
import club.jambuds.responses.UserProfile

class UserService(private val userDao: UserDao, private val colorSchemeDao: ColorSchemeDao) {
    fun getUserProfileByName(userName: String): UserProfile? {
        val user = userDao.getUserByUserName(userName) ?: return null

        val colorScheme = colorSchemeDao.getColorSchemeByUserId(user.id)

        return UserProfile(
            id = user.id,
            name = user.name,
            colorScheme = colorScheme
        )
    }
}
