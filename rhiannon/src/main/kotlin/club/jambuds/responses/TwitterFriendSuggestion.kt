package club.jambuds.responses

data class TwitterFriendSuggestion(
    val profile: UserProfile,
    val twitterName: String,
    val twitterAvatar: String
)
