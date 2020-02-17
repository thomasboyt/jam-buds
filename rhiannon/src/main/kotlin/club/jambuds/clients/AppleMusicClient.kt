package club.jambuds.clients

import com.google.gson.FieldNamingPolicy
import com.google.gson.Gson
import com.google.gson.GsonBuilder
import retrofit2.Call
import retrofit2.http.GET
import retrofit2.http.Query

interface AppleMusicClient {
    @GET("v1/catalog/us/songs")
    fun getSongsByISRC(@Query("filter[isrc]") isrc: String): Call<AppleMusicSearchResponse>
}

data class AppleMusicSongAttributes(
    val url: String
)

data class AppleMusicSearchResult(
    val id: String,
    val attributes: AppleMusicSongAttributes,
    val playParams: Map<String, Any>?
)

data class AppleMusicSearchResponse(
    val data: List<AppleMusicSearchResult>
)

fun getAppleMusicGson(): Gson {
    return GsonBuilder()
        .setFieldNamingPolicy(FieldNamingPolicy.LOWER_CASE_WITH_UNDERSCORES)
        .create()
}
