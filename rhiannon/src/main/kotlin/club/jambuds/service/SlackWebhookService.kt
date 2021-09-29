package club.jambuds.service

import club.jambuds.model.AdminNotifyType
import com.fasterxml.jackson.databind.DeserializationFeature
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.PropertyNamingStrategies
import com.fasterxml.jackson.module.kotlin.KotlinModule
import okhttp3.MediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody
import org.slf4j.LoggerFactory

interface AdminNotifyWebhookService {
    fun sendWebhook(type: AdminNotifyType, message: String)
}

open class SlackWebhookService(private val signupHookUrl: String, private val reportHookUrl: String) : AdminNotifyWebhookService {
    private val logger = LoggerFactory.getLogger(SlackWebhookService::class.java.name)

    private val objectMapper = ObjectMapper()
        .registerModule(KotlinModule())
        .setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE)
        .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)

    override fun sendWebhook(type: AdminNotifyType, message: String) {
        val hookUrl = when (type) {
            AdminNotifyType.SIGNUP -> signupHookUrl
            AdminNotifyType.REPORT -> reportHookUrl
        }

        val client = OkHttpClient()
        val body = objectMapper.writeValueAsString(mapOf(
            "text" to message
        ))

        val req = Request.Builder()
            .url(hookUrl)
            .post(RequestBody.create(MEDIA_TYPE_JSON, body))
            .build()

        client.newCall(req).execute().use { response ->
            if (!response.isSuccessful) {
                logger.error("Error sending Slack web hook: $response")
            }
        }
    }

    companion object {
        private val MEDIA_TYPE_JSON = MediaType.parse("application/json; charset=utf-8")
    }
}

class DevSlackWebhookService : AdminNotifyWebhookService {
    private val logger = LoggerFactory.getLogger(DevSlackWebhookService::class.java.name)

    override fun sendWebhook(type: AdminNotifyType, message: String) {
        logger.info("Sent web hook: $message")
    }
}
