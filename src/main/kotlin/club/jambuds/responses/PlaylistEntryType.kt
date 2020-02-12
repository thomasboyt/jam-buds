package club.jambuds.responses

import com.google.gson.annotations.SerializedName

enum class PlaylistEntryType {
    @SerializedName("song")
    SONG,
    @SerializedName("mixtape")
    MIXTAPE
}

