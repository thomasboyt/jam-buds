package club.jambuds.model

import com.fasterxml.jackson.annotation.JsonValue

enum class ItemSource(@get:JsonValue val type: String) {
    SPOTIFY("spotify"),
    BANDCAMP("bandcamp"),
    APPLEMUSIC("appleMusic");
}
