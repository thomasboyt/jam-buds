package club.jambuds.responses

import com.google.gson.annotations.Expose

data class SendSignInTokenSkipAuthResponse(
    @Expose val token: String,
    @Expose val isRegistration: Boolean
)
