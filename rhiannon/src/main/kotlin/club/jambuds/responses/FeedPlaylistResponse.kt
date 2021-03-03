package club.jambuds.responses

data class FeedPlaylistResponse(
    val items: List<FeedPlaylistEntry>,
    val limit: Int,
    val profiles: List<UserProfile>
)
