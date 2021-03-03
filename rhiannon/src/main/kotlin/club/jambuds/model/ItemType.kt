package club.jambuds.model

import com.fasterxml.jackson.annotation.JsonValue

enum class ItemType(@get:JsonValue val type: String) {
    SONG("song"),
    MIXTAPE("mixtape"),
    ALBUM("album")
}
