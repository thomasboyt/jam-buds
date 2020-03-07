package club.jambuds.responses

import com.google.gson.annotations.Expose

data class GetCurrentUserResponse(@Expose val user: CurrentUser?)
