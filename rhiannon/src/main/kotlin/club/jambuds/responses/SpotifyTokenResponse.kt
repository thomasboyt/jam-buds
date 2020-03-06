package club.jambuds.responses

import com.google.gson.annotations.Expose

data class SpotifyTokenResponse(
    @Expose val spotifyConnected: Boolean,
    @Expose val accessToken: String?,
    @Expose val expiresAtMs: Long?
)
