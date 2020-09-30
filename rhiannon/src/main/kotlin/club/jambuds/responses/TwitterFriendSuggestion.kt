package club.jambuds.responses

import com.google.gson.annotations.Expose

data class TwitterFriendSuggestion(
    @Expose val profile: UserProfile,
    @Expose val twitterName: String,
    @Expose val twitterAvatar: String
)
