package club.jambuds.responses

import com.google.gson.annotations.Expose

data class SignInResponse(
    @Expose val authToken: String
)
