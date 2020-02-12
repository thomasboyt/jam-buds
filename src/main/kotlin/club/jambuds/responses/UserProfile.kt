package club.jambuds.responses

import com.google.gson.annotations.Expose

data class UserProfile(
    @Expose val id: Int,
    @Expose val name: String
    // TODO: color scheme
)
