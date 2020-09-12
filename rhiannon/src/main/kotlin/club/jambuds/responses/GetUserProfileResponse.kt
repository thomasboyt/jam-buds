package club.jambuds.responses

import com.google.gson.annotations.Expose

data class GetUserProfileResponse(
    @Expose val userProfile: UserProfile
)
