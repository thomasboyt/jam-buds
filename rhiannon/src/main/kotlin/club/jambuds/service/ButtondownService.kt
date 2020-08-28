package club.jambuds.service

import club.jambuds.clients.ButtondownClient
import club.jambuds.clients.ButtondownCreateSubscriberBody
import io.javalin.http.InternalServerErrorResponse

// It would be nice if this had a separate "dev buttondown service" instead of the nullable client,
// but this will scale okay for now. Tests use a mock service, of course.
open class ButtondownService(private val client: ButtondownClient?) {
    fun getButtondownSubscriptionId(email: String): String? {
        if (client == null) {
            return null
        }

        val resp = client.getSubscribers(email = email, type = "regular").execute()
        if (!resp.isSuccessful) {
            throw InternalServerErrorResponse(
                "Error fetching subscription info for $email: ${resp.code()} \n" +
                    " ${resp.errorBody()!!.string()}"
            )
        }

        val results = resp.body()!!.results

        if (results.isEmpty()) {
            return null
        }

        return results[0].id
    }

    fun subscribe(email: String) {
        if (client == null) {
            return
        }

        val resp = client.createSubscriber(ButtondownCreateSubscriberBody(email)).execute()

        if (!resp.isSuccessful) {
            throw InternalServerErrorResponse(
                "Error subscribing $email to Buttondown: ${resp.code()} \n" +
                    " ${resp.errorBody()!!.string()}"
            )
        }
    }

    fun unsubscribe(buttondownId: String) {
        if (client == null) {
            return
        }

        val resp = client.deleteSubscriber(buttondownId).execute()

        if (!resp.isSuccessful) {
            throw InternalServerErrorResponse(
                "Error unsubscribing $buttondownId from Buttondown: ${resp.code()} \n" +
                " ${resp.errorBody()!!.string()}"
            )
        }
    }
}
