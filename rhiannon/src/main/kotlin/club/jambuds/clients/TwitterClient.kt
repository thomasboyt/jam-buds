package club.jambuds.clients

import club.jambuds.util.generateRandomString
import com.google.gson.Gson
import okhttp3.OkHttpClient
import okhttp3.Request
import okio.Buffer
import okio.ByteString
import retrofit2.Call
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Query
import java.net.URLEncoder
import java.nio.charset.StandardCharsets
import java.security.SecureRandom
import java.time.Instant
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec

interface TwitterClient {
    @POST("/1.1/statuses/update.json")
    fun postStatus(@Query("status") query: String): Call<TwitterPostResponse>

    @GET("/1.1/friends/ids.json")
    fun getFriendIds(@Query("stringify_ids") stringifyIds: Boolean = true): Call<FriendIdsResponse>
}

data class TwitterPostResponse(private val id_str: String)

data class FriendIdsResponse(val ids: List<String>)

private fun encodeValue(value: String): String {
    return URLEncoder.encode(value, StandardCharsets.UTF_8.toString())
}

fun createTwitterClient(
    consumerKey: String,
    consumerSecret: String,
    accessToken: String,
    accessSecret: String
): TwitterClient {
    val okHttpClient = OkHttpClient.Builder()
        .addInterceptor { chain ->
            val oauthNonce = generateRandomString(32)
            val authHeader = getAuthorizationHeader(
                consumerKey,
                consumerSecret,
                accessToken,
                accessSecret,
                oauthNonce,
                Instant.now().epochSecond,
                chain.request()
            )

            val signedRequest = chain.request().newBuilder()
                .addHeader("Authorization", authHeader)
                .build()

            chain.proceed(signedRequest)
        }
        .build()

    val retrofit = Retrofit.Builder()
        .baseUrl("https://api.twitter.com")
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create(Gson()))
        .build()

    return retrofit.create(TwitterClient::class.java)
}

// adapted from https://gist.github.com/JakeWharton/f26f19732f0c5907e1ab
fun getAuthorizationHeader(
    consumerKey: String,
    consumerSecret: String,
    accessToken: String,
    accessSecret: String,
    oauthNonce: String,
    timestamp: Number,
    request: Request
): String {
    // Map of headers, minus oauth signature, since that is added later
    val headers = mutableMapOf(
        "oauth_consumer_key" to consumerKey,
        "oauth_nonce" to oauthNonce,
        "oauth_signature_method" to "HMAC-SHA1",
        "oauth_timestamp" to timestamp.toString(),
        "oauth_token" to accessToken,
        "oauth_version" to "1.0"
    )

    // signature creation:
    // https://developer.twitter.com/en/docs/basics/authentication/oauth-1-0a/creating-a-signature

    val parameters = headers.toMutableMap()

    // parse url params
    val url = request.url()
    for (i in 0 until url.querySize()) {
        val key = encodeValue(url.queryParameterName(i))
        val value = encodeValue(url.queryParameterValue(i)).replace("+", "%20")
        parameters[key] = value
    }

    val requestBody = request.body()
    val body = Buffer()
    requestBody?.writeTo(body)

    // parse body params
    while (!body.exhausted()) {
        val keyEnd: Long = body.indexOf('='.toByte())
        check(keyEnd != -1L) { "Key with no value: " + body.readUtf8() }
        val key: String = body.readUtf8(keyEnd)
        body.skip(1) // Equals.
        val valueEnd: Long = body.indexOf('&'.toByte())
        val value: String = if (valueEnd == -1L) body.readUtf8() else body.readUtf8(valueEnd)
        if (valueEnd != -1L) body.skip(1) // Ampersand.
        parameters[key] = value.replace("+", "%2B")
    }

    // write method and path (without query params) to signature base
    val paramString = Buffer()
    paramString.writeUtf8(request.method())
    paramString.writeByte('&'.toInt())
    paramString.writeUtf8(encodeValue(url.newBuilder().query(null).build().toString()))
    paramString.writeByte('&'.toInt())

    // get all params on the thing
    val joinedParams = parameters
        .toSortedMap(compareBy { encodeValue(it) })
        .map { param ->
            val key = param.key
            val value = param.value
            "$key=$value"
        }
        .joinToString("&")

    paramString.writeUtf8(encodeValue(joinedParams))

    val signingKey = encodeValue(consumerSecret) + "&" + encodeValue(accessSecret)

    val keySpec = SecretKeySpec(signingKey.toByteArray(), "HmacSHA1")
    val mac = Mac.getInstance("HmacSHA1")
    mac.init(keySpec)
    val result = mac.doFinal(paramString.readByteArray())
    val signature = ByteString.of(*result).base64()

    headers["oauth_signature"] = signature

    val headerStrings = headers.map { header ->
        val key = encodeValue(header.key)
        val value = encodeValue(header.value)
        "$key=\"$value\""
    }.sorted()

    return "OAuth " + headerStrings.joinToString(", ")
}
