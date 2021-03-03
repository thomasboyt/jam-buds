package club.jambuds.model

import com.fasterxml.jackson.annotation.JsonValue
import java.time.Instant

enum class NotificationType(@JsonValue val sqlVal: String) {
    LIKE("like"),
    FOLLOW("follow"),
    JOIN("join"),
    SYSTEM("system")
}

data class Notification(
    val id: Int,
    val createdAt: Instant,
    val targetUserId: Int,
    val type: NotificationType,
    val notificationUserId: Int?,
    val notificationSongId: Int?,
    val notificationSystemMessage: String?,
    val read: Boolean
)
