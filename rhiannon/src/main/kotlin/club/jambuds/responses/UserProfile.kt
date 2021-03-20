package club.jambuds.responses

import club.jambuds.model.ColorScheme

data class UserProfile(
    val id: Int,
    val name: String,
    val colorScheme: ColorScheme
)
