package club.jambuds.model

import com.google.gson.annotations.SerializedName

enum class ItemType(val type: String) {
    @SerializedName("song")
    SONG("song"),
    @SerializedName("mixtape")
    MIXTAPE("mixtape"),
    @SerializedName("album")
    ALBUM("album")
}
