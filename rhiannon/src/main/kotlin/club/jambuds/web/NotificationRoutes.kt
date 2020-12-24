package club.jambuds.web

import club.jambuds.service.NotificationService
import club.jambuds.web.extensions.requireUser
import io.javalin.apibuilder.ApiBuilder
import io.javalin.http.Context
import io.javalin.plugin.openapi.annotations.OpenApi

class NotificationRoutes(private val notificationService: NotificationService) {
    fun register() {
        ApiBuilder.get("/api/notifications", this::getNotifications)
        ApiBuilder.post("/api/notifications/mark-all-read", this::markAllRead)
        ApiBuilder.post("/api/notifications/:id/read", this::markOneRead)
    }

    @OpenApi(ignore = true)
    private fun getNotifications(ctx: Context) {
        val currentUser = ctx.requireUser()
        val notifications =
            notificationService.getUnreadNotificationsByUserId(userId = currentUser.id)
        ctx.json(notifications)
    }

    @OpenApi(ignore = true)
    private fun markAllRead(ctx: Context) {
        val currentUser = ctx.requireUser()
        notificationService.markAllReadForUserId(userId = currentUser.id)
        ctx.status(204)
    }

    @OpenApi(ignore = true)
    private fun markOneRead(ctx: Context) {
        val currentUser = ctx.requireUser()
        val notificationId = ctx.pathParam<Int>("id").get()
        notificationService.markOneRead(notificationId = notificationId, user = currentUser)
        ctx.status(204)
    }
}
