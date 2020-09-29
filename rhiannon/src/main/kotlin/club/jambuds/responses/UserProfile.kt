package club.jambuds.responses

import club.jambuds.model.ColorScheme
import com.google.gson.annotations.Expose

data class UserProfile(
    @Expose val id: Int,
    @Expose val name: String,
    @Expose val colorScheme: ColorScheme
)
