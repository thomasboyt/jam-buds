package club.jambuds.responses

import com.google.gson.annotations.Expose

data class CurrentUser(
    @Expose val id: Int,
    @Expose val name: String,
    @Expose val following: List<PublicUser>,
    @Expose val twitterName: String?,
    @Expose val showInPublicFeed: Boolean,
    @Expose val email: String,
    @Expose val unreadNotificationCount: Int,
    @Expose val profile: UserProfile
)
