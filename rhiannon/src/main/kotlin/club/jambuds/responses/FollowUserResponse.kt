package club.jambuds.responses

import com.google.gson.annotations.Expose

data class FollowUserResponse(
    @Expose val user: PublicUser
)
