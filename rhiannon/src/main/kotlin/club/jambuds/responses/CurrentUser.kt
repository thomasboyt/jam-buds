package club.jambuds.responses

data class CurrentUser(
    val id: Int,
    val name: String,
    val following: List<PublicUser>,
    val twitterName: String?,
    val showInPublicFeed: Boolean,
    val email: String,
    val unreadNotificationCount: Int,
    val profile: UserProfile
)
