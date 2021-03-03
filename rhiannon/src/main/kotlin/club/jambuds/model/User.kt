package club.jambuds.model

import com.fasterxml.jackson.annotation.JsonIgnoreType

@JsonIgnoreType
data class User(
    val id: Int,
    val name: String,
    val email: String,
    val twitterName: String?,
    val twitterId: String?,
    val twitterToken: String?,
    val twitterSecret: String?,
    val showInPublicFeed: Boolean
)
