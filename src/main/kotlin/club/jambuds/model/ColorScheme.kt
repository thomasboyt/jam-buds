package club.jambuds.model

import com.google.gson.annotations.Expose

data class ColorScheme(
    val id: Int,
    val userId: Int,
    @Expose val backgroundGradientName: String,
    @Expose val textColor: String
)
