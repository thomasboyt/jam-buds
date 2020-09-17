package club.jambuds.responses

import com.google.gson.annotations.Expose

data class UserPlaylistResponse(
    @Expose val items: List<UserPlaylistEntry>,
    @Expose val limit: Int
)
