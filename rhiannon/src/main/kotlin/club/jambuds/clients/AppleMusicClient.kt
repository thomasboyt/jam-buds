package club.jambuds.clients

import com.fasterxml.jackson.databind.DeserializationFeature
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.KotlinModule
import retrofit2.Call
import retrofit2.http.GET
import retrofit2.http.Query

interface AppleMusicClient {
    @GET("v1/catalog/us/songs")
    fun getSongsByISRC(@Query("filter[isrc]") isrc: String): Call<AppleMusicGetSongsByISRCResponse>

    @GET("v1/catalog/us/search")
    fun search(
        @Query("term") term: String,
        @Query("types") types: String,
        // XXX: This isn't documented and could go away, which would be bad
        @Query("relate[albums]") relateAlbums: String = "artists"
    ): Call<AppleMusicSearchResponse>
}

// https://developer.apple.com/documentation/applemusicapi/artist/attributes
data class AppleMusicArtistAttributes(
    val name: String
)

data class AppleMusicArtist(
    val attributes: AppleMusicArtistAttributes
)

data class AppleMusicSongAttributes(
    val url: String,
    val playParams: Map<String, Any>?
)

data class AppleMusicSearchSongItem(
    val id: String,
    val attributes: AppleMusicSongAttributes
)

data class AppleMusicAlbumAttributes(
    val url: String,
    val playParams: Map<String, Any>?,
    val name: String,
    val artistName: String
)

// https://developer.apple.com/documentation/applemusicapi/album/relationships
data class AppleMusicAlbumRelationships(
    val artists: AppleMusicArtistRelationship
)

data class AppleMusicArtistRelationship(
    val data: List<AppleMusicArtist>
)

data class AppleMusicSearchAlbumItem(
    val id: String,
    val attributes: AppleMusicAlbumAttributes,
    val relationships: AppleMusicAlbumRelationships
)

data class AppleMusicGetSongsByISRCResponse(
    val data: List<AppleMusicSearchSongItem>
)

data class AppleMusicSearchResponse(
    val results: AppleMusicSearchResults
)

data class AppleMusicSearchResults(
    val albums: Data<AppleMusicSearchAlbumItem>?
) {
    data class Data<T>(
        val data: List<T>
    )
}

fun getAppleMusicObjectMapper(): ObjectMapper {
    return ObjectMapper().registerModule(KotlinModule())
        .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
}
