package club.jambuds.model

data class User(
    val id: Int,
    val name: String,
    val twitterToken: String?,
    val twitterSecret: String?
)
