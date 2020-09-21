package club.jambuds.responses

import club.jambuds.model.NotificationType
import com.google.gson.annotations.Expose
import java.time.Instant

data class NotificationItem(
    @Expose val id: Int,
    @Expose val type: NotificationType,
    @Expose val user: PublicUser?,
    @Expose val timestamp: Instant,
    @Expose val seen: Boolean
)
