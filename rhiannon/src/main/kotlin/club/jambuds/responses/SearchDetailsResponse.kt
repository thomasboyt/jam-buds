package club.jambuds.responses

import com.google.gson.annotations.Expose

data class SearchDetailsResponse(
    @Expose val spotifyId: String,
    @Expose val appleMusicId: String?
)
