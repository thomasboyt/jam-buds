package club.jambuds.responses

import club.jambuds.model.NotificationType
import com.google.gson.annotations.Expose

data class NotificationItem(
    @Expose val id: Int,
    @Expose val type: NotificationType,
    @Expose val user: PublicUser?
)
