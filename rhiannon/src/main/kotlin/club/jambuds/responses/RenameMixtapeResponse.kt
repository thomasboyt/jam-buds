package club.jambuds.responses

import com.google.gson.annotations.Expose

data class RenameMixtapeResponse(
    @Expose val newSlug: String
)
