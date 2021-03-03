package club.jambuds.clients

import com.fasterxml.jackson.databind.DeserializationFeature
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.PropertyNamingStrategies
import com.fasterxml.jackson.module.kotlin.KotlinModule
import okhttp3.OkHttpClient
import retrofit2.Call
import retrofit2.Retrofit
import retrofit2.converter.jackson.JacksonConverterFactory
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

interface ButtondownClient {
    @GET("v1/subscribers")
    fun getSubscribers(
        @Query("email") email: String,
        @Query("type") type: String
    ): Call<ButtondownGetSubscribersResponse>

    @POST("v1/subscribers")
    fun createSubscriber(
        @Body body: ButtondownCreateSubscriberBody
    ): Call<ButtondownCreateSubscriberResponse>

    @DELETE("v1/subscribers/{id}")
    fun deleteSubscriber(@Path("id") id: String): Call<Void>
}

data class ButtondownGetSubscribersResult(
    val id: String
)

data class ButtondownGetSubscribersResponse(
    val results: List<ButtondownGetSubscribersResult>
)

data class ButtondownCreateSubscriberBody(
    val email: String
)

data class ButtondownCreateSubscriberResponse(
    val id: String
)

fun createButtondownClient(apiKey: String): ButtondownClient {
    val okHttpClient = OkHttpClient.Builder().addInterceptor { chain ->
        val req = chain.request()
        val newReq = req.newBuilder()
            .addHeader("Authorization", "Token $apiKey")
            .build()
        chain.proceed(newReq)
    }.build()

    val retrofit = Retrofit.Builder()
        .baseUrl("https://api.buttondown.email")
        .addConverterFactory(JacksonConverterFactory.create(getButtondownObjectMapper()))
        .client(okHttpClient)
        .build()

    return retrofit.create(ButtondownClient::class.java)
}

private fun getButtondownObjectMapper(): ObjectMapper {
    return ObjectMapper()
        .registerModule(KotlinModule())
        .setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE)
        .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
}
