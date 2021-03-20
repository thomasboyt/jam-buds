package club.jambuds.model

import com.fasterxml.jackson.annotation.JsonIgnore

data class ColorScheme(
    @JsonIgnore val id: Int,
    @JsonIgnore val userId: Int,
    val backgroundGradientName: String,
    val textColor: String
)
