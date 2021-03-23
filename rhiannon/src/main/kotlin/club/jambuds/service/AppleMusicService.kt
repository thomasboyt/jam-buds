package club.jambuds.service

import club.jambuds.clients.AppleMusicClient
import club.jambuds.clients.AppleMusicSearchAlbumItem
import club.jambuds.clients.AppleMusicSearchResults
import club.jambuds.clients.AppleMusicSearchSongItem
import club.jambuds.clients.getAppleMusicObjectMapper
import club.jambuds.model.cache.AlbumSearchCache
import club.jambuds.util.FuzzySearchLogic
import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import okhttp3.OkHttpClient
import org.bouncycastle.asn1.pkcs.PrivateKeyInfo
import org.bouncycastle.openssl.PEMParser
import org.bouncycastle.openssl.jcajce.JcaPEMKeyConverter
import retrofit2.Retrofit
import java.io.StringReader
import java.security.interfaces.ECPrivateKey
import java.time.Instant
import java.time.temporal.ChronoUnit
import java.util.Date
import retrofit2.converter.jackson.JacksonConverterFactory

open class AppleMusicService(musickitToken: String, private val disabled: Boolean = false) {
    private val okHttpClient = OkHttpClient.Builder().addInterceptor { chain ->
        val req = chain.request()
        val newReq = req.newBuilder()
            .addHeader("Authorization", "Bearer $musickitToken")
            .build()
        chain.proceed(newReq)
    }.build()

    private val retrofit = Retrofit.Builder()
        .baseUrl("https://api.music.apple.com")
        .addConverterFactory(JacksonConverterFactory.create(getAppleMusicObjectMapper()))
        .client(okHttpClient)
        .build()

    private val client = retrofit.create(AppleMusicClient::class.java)

    open fun getSongDetailsByIsrc(isrc: String): AppleMusicSearchSongItem? {
        if (disabled) {
            throw Error(
                "Attempted to use AppleMusicService even though it was configured as disabled"
            )
        }

        val resp = client.getSongsByISRC(isrc).execute()

        if (!resp.isSuccessful) {
            println(resp.errorBody()!!.string())
            throw Error("Exception fetching Apple Music details: ${resp.code()} ${resp.message()}")
        }

        val body = resp.body() ?: throw Error("Empty body received")

        if (body.data.isEmpty()) {
            return null
        }

        if (body.data[0].attributes.playParams == null) {
            // when play params is null, that means the song can be played in iTunes, but not
            // apple music
            return null
        }

        return body.data[0]
    }

    open fun getAlbumByExistingDetails(album: AlbumSearchCache): AppleMusicSearchAlbumItem? {
        if (disabled) {
            throw Error(
                "Attempted to use AppleMusicService even though it was configured as disabled"
            )
        }

        fun searchWithTitle(title: String): AppleMusicSearchResults {
            val artists = album.artists.joinToString(" ")
            return search("$title $artists")
        }

        var results = searchWithTitle(album.title)
        var result = results.albums?.data?.find { item ->
            val namesEqual = FuzzySearchLogic.albumTitleMatchExact(
                expected = album.title,
                result = item.attributes.name
            )
            val artistsEqual = FuzzySearchLogic.artistsMatch(
                expected = album.artists,
                result = item.relationships.artists.data.map { it.attributes.name }
            )
            namesEqual && artistsEqual
        }

        if (result != null) {
            return result
        }

        // try again with the title cleaned of remaster, deluxe, whatever info
        val cleanedTitle = FuzzySearchLogic.cleanAlbumTitle(album.title)
        results = searchWithTitle(cleanedTitle)
        result = results.albums?.data?.find { item ->
            val namesEqual = FuzzySearchLogic.albumTitleMatchLoose(
                expected = cleanedTitle,
                result = item.attributes.name
            )
            val artistsEqual = FuzzySearchLogic.artistsMatch(
                expected = album.artists,
                result = item.relationships.artists.data.map { it.attributes.name }
            )
            namesEqual && artistsEqual
        }
        return result
    }

    private fun search(query: String): AppleMusicSearchResults {
        // this is stupid, but this is a load-bearing `types` param - removing artists or songs
        // causes albums[].relationships.artists[].attributes to not be filled in for some reason
        val resp = client.search(term = query, types = "artists,albums,songs").execute()

        if (!resp.isSuccessful) {
            println(resp.errorBody()!!.string())
            throw Error("Exception searching Apple Music: ${resp.code()} ${resp.message()}")
        }

        val body = resp.body() ?: throw Error("Empty body received")

        return body.results
    }

    companion object {
        fun createAuthToken(key: String, keyId: String, teamId: String): String {
            val pemParser = PEMParser(StringReader(key))
            val privateKey =
                JcaPEMKeyConverter().getPrivateKey(pemParser.readObject() as PrivateKeyInfo)
            val algorithm = Algorithm.ECDSA256(null, privateKey as ECPrivateKey)
            return JWT.create()
                .withIssuer(teamId)
                .withKeyId(keyId)
                .withExpiresAt(Date.from(Instant.now().plus(180, ChronoUnit.DAYS)))
                .sign(algorithm)
        }
    }
}
