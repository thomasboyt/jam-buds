package club.jambuds.web

import club.jambuds.responses.NotificationItem
import club.jambuds.service.NotificationService
import club.jambuds.web.extensions.requireUser
import io.javalin.apibuilder.ApiBuilder
import io.javalin.http.Context
import io.javalin.plugin.openapi.annotations.OpenApi
import io.javalin.plugin.openapi.annotations.OpenApiContent
import io.javalin.plugin.openapi.annotations.OpenApiParam
import io.javalin.plugin.openapi.annotations.OpenApiResponse

class NotificationRoutes(private val notificationService: NotificationService) {
    fun register() {
        ApiBuilder.get("/api/notifications", this::getNotifications)
        ApiBuilder.post("/api/notifications/mark-all-read", this::markAllRead)
        ApiBuilder.post("/api/notifications/{id}/read", this::markOneRead)
    }

    @OpenApi(
        tags = ["Notifications"],
        summary = "Fetch the current user's notifications",
        responses = [OpenApiResponse("200", [OpenApiContent(NotificationItem::class, isArray = true)])]
    )
    private fun getNotifications(ctx: Context) {
        val currentUser = ctx.requireUser()
        val notifications =
            notificationService.getUnreadNotificationsByUserId(userId = currentUser.id)
        ctx.json(notifications)
    }

    @OpenApi(
        tags = ["Notifications"],
        summary = "Mark the current user's notifications as read",
        responses = [OpenApiResponse("204")]
    )
    private fun markAllRead(ctx: Context) {
        val currentUser = ctx.requireUser()
        notificationService.markAllReadForUserId(userId = currentUser.id)
        ctx.status(204)
    }

    @OpenApi(
        tags = ["Notifications"],
        summary = "Mark one of the current user's notifications as read",
        responses = [OpenApiResponse("204")],
        pathParams = [OpenApiParam(name = "notificationId",  type = Int::class)]
    )
    private fun markOneRead(ctx: Context) {
        val currentUser = ctx.requireUser()
        val notificationId = ctx.pathParamAsClass<Int>("id").get()
        notificationService.markOneRead(notificationId = notificationId, user = currentUser)
        ctx.status(204)
    }
}
