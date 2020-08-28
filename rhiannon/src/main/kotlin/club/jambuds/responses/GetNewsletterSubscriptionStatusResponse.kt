package club.jambuds.responses

import com.google.gson.annotations.Expose

data class GetNewsletterSubscriptionStatusResponse(
    @Expose val subscribed: Boolean
)
