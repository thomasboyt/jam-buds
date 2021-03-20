package club.jambuds.responses

import club.jambuds.model.MixtapePreview

data class GetDraftMixtapesResponse(
    val mixtapes: List<MixtapePreview>
)
