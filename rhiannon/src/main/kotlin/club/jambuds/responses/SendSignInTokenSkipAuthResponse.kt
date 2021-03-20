package club.jambuds.responses

data class SendSignInTokenSkipAuthResponse(
    val token: String,
    val isRegistration: Boolean
)
