package club.jambuds.responses



data class SearchDetailsResponse(
    val spotifyId: String,
    val appleMusicId: String?,
    val appleMusicUrl: String?
)
