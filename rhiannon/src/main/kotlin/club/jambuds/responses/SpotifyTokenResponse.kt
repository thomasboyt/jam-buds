package club.jambuds.responses

data class SpotifyTokenResponse(
    val spotifyConnected: Boolean,
    val accessToken: String?,
    val expiresAtMs: Long?
)
