package club.jambuds.responses

import com.google.gson.annotations.Expose

data class ValidateSignInCodeResponse(
    @Expose val signInToken: String,
    @Expose val isRegistration: Boolean,
    @Expose val redirect: String
)
