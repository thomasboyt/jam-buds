package club.jambuds.clients

import com.google.gson.FieldNamingPolicy
import com.google.gson.Gson
import com.google.gson.GsonBuilder
import okhttp3.OkHttpClient
import retrofit2.Call
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
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
        .addConverterFactory(GsonConverterFactory.create(getButtondownGson()))
        .client(okHttpClient)
        .build()

    return retrofit.create(ButtondownClient::class.java)
}

private fun getButtondownGson(): Gson {
    return GsonBuilder()
        .setFieldNamingPolicy(FieldNamingPolicy.LOWER_CASE_WITH_UNDERSCORES)
        .create()
}
