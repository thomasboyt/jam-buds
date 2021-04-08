package club.jambuds.responses

data class UserPlaylistResponse(
    val items: List<UserPlaylistEntry>,
    val limit: Int,
    val profiles: List<UserProfile>
)
