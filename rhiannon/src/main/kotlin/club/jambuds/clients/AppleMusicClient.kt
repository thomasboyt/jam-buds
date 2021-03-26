package club.jambuds.clients

import com.fasterxml.jackson.databind.DeserializationFeature
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.KotlinModule
import retrofit2.Call
import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query

interface AppleMusicClient {
    @GET("v1/catalog/us/songs/{id}")
    fun getSongById(
        @Path("id") id: String,
        @Query("include[songs]") includeSongs: String = "artists"
    ): Call<AppleMusicGetSongsResponse>

    @GET("v1/catalog/us/albums/{id}")
    fun getAlbumById(
        @Path("id") id: String,
        @Query("include[albums]") includeAlbums: String = "artists"
    ): Call<AppleMusicGetAlbumsResponse>

    @GET("v1/catalog/us/songs")
    fun getSongsByISRC(
        @Query("filter[isrc]") isrc: String,
        @Query("include[songs]") includeSongs: String = "artists"
    ): Call<AppleMusicGetSongsResponse>

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

data class AppleMusicArtwork(
    val url: String
) {
    fun getUrl(width: Int = 640, height: Int = 640): String {
         return url
            .replace("{w}", width.toString())
            .replace("{h}", height.toString())
    }
}

data class AppleMusicSongAttributes(
    val albumName: String,
    val artwork: AppleMusicArtwork,
    val isrc: String,
    val name: String,
    val playParams: Map<String, Any>?,
    val url: String
)

data class AppleMusicSongRelationships(
    val artists: AppleMusicArtistRelationship
)

data class AppleMusicSearchSongItem(
    val id: String,
    val attributes: AppleMusicSongAttributes,
    val relationships: AppleMusicSongRelationships
)

data class AppleMusicAlbumAttributes(
    val artistName: String,
    val artwork: AppleMusicArtwork,
    val name: String,
    val playParams: Map<String, Any>?,
    val url: String
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

data class AppleMusicGetSongsResponse(
    val data: List<AppleMusicSearchSongItem>
)

data class AppleMusicGetAlbumsResponse(
    val data: List<AppleMusicSearchAlbumItem>
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
