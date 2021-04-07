package club.jambuds.model

import com.fasterxml.jackson.annotation.JsonValue

enum class LikeSource(@get:JsonValue val type: String) {
    POST("post"),
    LIKE("like"),
    MIXTAPE("mixtape");

    override fun toString(): String {
        return type
    }
}
