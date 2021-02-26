package club.jambuds.model

import com.google.gson.annotations.Expose

data class ItemMeta(
    @Expose val likeCount: Int,
    @Expose val isLiked: Boolean
)

