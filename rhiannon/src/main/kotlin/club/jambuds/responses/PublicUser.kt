package club.jambuds.responses

import com.google.gson.annotations.Expose

data class PublicUser(
    @Expose val id: Int,
    @Expose val name: String
)
