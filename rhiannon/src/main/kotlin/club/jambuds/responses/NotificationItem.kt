package club.jambuds.responses

import club.jambuds.model.NotificationType
import java.time.Instant

data class NotificationItem(
    val id: Int,
    val type: NotificationType,
    val body: String,
    val url: String,
    val timestamp: Instant,
    val seen: Boolean
)
