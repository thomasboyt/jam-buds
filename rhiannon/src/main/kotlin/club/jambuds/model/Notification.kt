package club.jambuds.model

import com.fasterxml.jackson.annotation.JsonValue
import java.time.Instant

enum class NotificationType(@get:JsonValue val type: String) {
    LIKE("like"),
    FOLLOW("follow"),
    JOIN("join"),
    SYSTEM("system");

    override fun toString(): String {
        return type
    }
}

data class Notification(
    val id: Int,
    val createdAt: Instant,
    val key: String,
    val targetUserId: Int,
    val type: NotificationType,
    val body: String,
    val url: String,
    val read: Boolean
)
