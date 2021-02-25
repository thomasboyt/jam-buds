package club.jambuds.responses

import club.jambuds.model.Mixtape
import com.google.gson.annotations.Expose

data class GetDraftMixtapesResponse(
    @Expose val mixtapes: List<Mixtape>
)
