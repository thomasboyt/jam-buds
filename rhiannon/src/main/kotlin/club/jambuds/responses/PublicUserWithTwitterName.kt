package club.jambuds.responses

import com.google.gson.annotations.Expose

data class PublicUserWithTwitterName(
    @Expose val id: Int,
    @Expose val name: String,
    @Expose val twitterName: String
)
