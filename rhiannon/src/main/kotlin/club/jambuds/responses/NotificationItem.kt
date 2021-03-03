package club.jambuds.responses

import club.jambuds.model.NotificationType
import java.time.Instant

data class NotificationItem(
    val id: Int,
    val type: NotificationType,
    val user: PublicUser?,
    val timestamp: Instant,
    val seen: Boolean
)
