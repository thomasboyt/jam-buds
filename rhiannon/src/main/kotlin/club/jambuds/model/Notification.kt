package club.jambuds.model

import com.google.gson.annotations.SerializedName
import java.time.Instant

enum class NotificationType(val sqlVal: String) {
    @SerializedName("like")
    LIKE("like"),

    @SerializedName("follow")
    FOLLOW("follow"),

    @SerializedName("join")
    JOIN("join"),

    @SerializedName("system")
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
