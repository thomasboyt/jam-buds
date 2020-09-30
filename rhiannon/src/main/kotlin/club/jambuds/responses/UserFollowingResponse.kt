package club.jambuds.responses

import com.google.gson.annotations.Expose

data class UserFollowingResponse(
    @Expose val users: List<UserProfile>
)
