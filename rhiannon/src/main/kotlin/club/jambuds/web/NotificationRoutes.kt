package club.jambuds.web

import club.jambuds.service.NotificationService
import club.jambuds.web.extensions.requireUser
import io.javalin.apibuilder.ApiBuilder
import io.javalin.http.Context

class NotificationRoutes(private val notificationService: NotificationService) {
    fun register() {
        ApiBuilder.get("/api/notifications", this::getNotifications)
        ApiBuilder.post("/api/notifications/mark-all-read", this::markAllRead)
    }

    private fun getNotifications(ctx: Context) {
        val currentUser = ctx.requireUser()
        val notifications =
            notificationService.getUnreadNotificationsByUserId(userId = currentUser.id)
        ctx.json(notifications)
    }

    private fun markAllRead(ctx: Context) {
        val currentUser = ctx.requireUser()
        val notifications =
            notificationService.markAllReadForUserId(userId = currentUser.id)
        ctx.status(204)
    }
}
