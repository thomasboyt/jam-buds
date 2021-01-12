package club.jambuds.responses

import com.google.gson.annotations.Expose
import com.google.gson.annotations.SerializedName

// https://developer.spotify.com/documentation/ios/guides/token-swap-and-refresh/
data class SwapSpotifyTokenResponse(
    @SerializedName("refresh_token")
    @Expose val refreshToken: String,
    @SerializedName("access_token")
    @Expose val accessToken: String,
    @SerializedName("expires_in")
    @Expose val expiresIn: Int
)
