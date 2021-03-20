package club.jambuds.web

import club.jambuds.dao.ColorSchemeDao
import club.jambuds.dao.UserDao
import club.jambuds.responses.GetNewsletterSubscriptionStatusResponse
import club.jambuds.service.ButtondownService
import club.jambuds.web.extensions.requireUser
import club.jambuds.web.extensions.validateJsonBody
import io.javalin.apibuilder.ApiBuilder
import io.javalin.http.Context
import io.javalin.plugin.openapi.annotations.OpenApi
import io.javalin.plugin.openapi.annotations.OpenApiContent
import io.javalin.plugin.openapi.annotations.OpenApiRequestBody
import io.javalin.plugin.openapi.annotations.OpenApiResponse

class SettingsRoutes(
    private val buttondownService: ButtondownService,
    private val userDao: UserDao,
    private val colorSchemeDao: ColorSchemeDao
) {
    fun register() {
        ApiBuilder.get("/api/settings/email-subscription", this::getNewsletterSubscriptionStatus)
        ApiBuilder.post("/api/settings/email-subscription", this::subscribeToNewsletter)
        ApiBuilder.delete("/api/settings/email-subscription", this::unsubscribeFromNewsletter)
        ApiBuilder.post("/api/settings/color-scheme", this::updateColorScheme)
        ApiBuilder.post("/api/settings/go-public", this::showInPublicFeed)
        ApiBuilder.post("/api/settings/go-private", this::hideInPublicFeed)
    }

    @OpenApi(
        tags = ["Newsletter"],
        summary = "Get newsletter subscription status",
        responses = [OpenApiResponse(
            "200",
            [OpenApiContent(GetNewsletterSubscriptionStatusResponse::class)]
        )]
    )
    private fun getNewsletterSubscriptionStatus(ctx: Context) {
        val user = ctx.requireUser()
        val subscriptionId = buttondownService.getButtondownSubscriptionId(user.email)
        val isSubscribed = subscriptionId != null
        ctx.json(GetNewsletterSubscriptionStatusResponse(subscribed = isSubscribed))
    }

    @OpenApi(
        tags = ["Newsletter"],
        summary = "Subscribe to the newsletter",
        responses = [OpenApiResponse("204")]
    )
    private fun subscribeToNewsletter(ctx: Context) {
        val user = ctx.requireUser()
        val subscriptionId = buttondownService.getButtondownSubscriptionId(user.email)

        if (subscriptionId == null) {
            buttondownService.subscribe(user.email)
        }

        ctx.status(204)
    }

    @OpenApi(
        tags = ["Newsletter"],
        summary = "Unsubscribe from the newsletter",
        responses = [OpenApiResponse("204")]
    )
    private fun unsubscribeFromNewsletter(ctx: Context) {
        val user = ctx.requireUser()
        val subscriptionId = buttondownService.getButtondownSubscriptionId(user.email)

        if (subscriptionId != null) {
            buttondownService.unsubscribe(subscriptionId)
        }

        ctx.status(204)
    }

    data class UpdateColorSchemeBody(
        val backgroundGradientName: String,
        val textColor: String
    )

    @OpenApi(
        tags = ["Color schemes"],
        summary = "Update the current user's color scheme",
        requestBody = OpenApiRequestBody([OpenApiContent(UpdateColorSchemeBody::class)]),
        responses = [OpenApiResponse("204")]
    )
    private fun updateColorScheme(ctx: Context) {
        val user = ctx.requireUser()
        val colorScheme = ctx.validateJsonBody(UpdateColorSchemeBody::class.java)
        colorSchemeDao.setColorSchemeForUserId(
            userId = user.id,
            backgroundGradientName = colorScheme.backgroundGradientName,
            textColor = colorScheme.textColor
        )
        ctx.status(204)
    }

    @OpenApi(
        tags = ["Privacy"],
        summary = "Show user in public feed",
        responses = [OpenApiResponse("204")]
    )
    private fun showInPublicFeed(ctx: Context) {
        val user = ctx.requireUser()
        userDao.updatePublicFeedVisibility(user.id, showInPublicFeed = true)
        ctx.status(204)
    }

    @OpenApi(
        tags = ["Privacy"],
        summary = "Hide user in public feed",
        responses = [OpenApiResponse("204")]
    )
    private fun hideInPublicFeed(ctx: Context) {
        val user = ctx.requireUser()
        userDao.updatePublicFeedVisibility(user.id, showInPublicFeed = false)
        ctx.status(204)
    }
}
