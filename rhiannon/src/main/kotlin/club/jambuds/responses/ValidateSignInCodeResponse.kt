package club.jambuds.responses

data class ValidateSignInCodeResponse(
    val signInToken: String,
    val isRegistration: Boolean,
    val redirect: String
)
