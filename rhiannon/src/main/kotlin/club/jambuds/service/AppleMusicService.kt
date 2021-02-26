package club.jambuds.service

import club.jambuds.clients.AppleMusicClient
import club.jambuds.clients.AppleMusicSearchAlbumItem
import club.jambuds.clients.AppleMusicSearchResults
import club.jambuds.clients.AppleMusicSearchSongItem
import club.jambuds.clients.getAppleMusicGson
import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import com.wrapper.spotify.model_objects.specification.AlbumSimplified
import okhttp3.OkHttpClient
import org.bouncycastle.asn1.pkcs.PrivateKeyInfo
import org.bouncycastle.openssl.PEMParser
import org.bouncycastle.openssl.jcajce.JcaPEMKeyConverter
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.io.File
import java.io.FileReader
import java.security.interfaces.ECPrivateKey
import java.time.Instant
import java.time.temporal.ChronoUnit
import java.util.Date

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
        .addConverterFactory(GsonConverterFactory.create(getAppleMusicGson()))
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

    fun getAlbumBySpotifyDetails(spotifyAlbum: AlbumSimplified): AppleMusicSearchAlbumItem? {
        if (disabled) {
            throw Error(
                "Attempted to use AppleMusicService even though it was configured as disabled"
            )
        }

        fun testArtistsMatch(result: AppleMusicSearchAlbumItem): Boolean {
            // TODO: this artist check relies on an undocumented query param to get the set of
            // artists from apple music. I'd prefer to use result.attributes.artistName, but I am
            // concerned about how Apple combines artists names - what Spotify has as
            // (St Vincent, David Byrne) becomes "David Byrne & St Vincent", and I need to make sure
            // both are present in the string and, ideally, nothing else is present...
            val spotifyArtists = spotifyAlbum.artists.map { it.name }.toSet()
            val appleMusicArtists = result.relationships.artists.data.map { it.attributes.name }.toSet()
            return spotifyArtists == appleMusicArtists
        }

        fun searchWithTitle(title: String): AppleMusicSearchResults {
            val artists = spotifyAlbum.artists.joinToString(" ") { it.name }
            return search("$title $artists")
        }

        var results = searchWithTitle(spotifyAlbum.name)
        var result = results.albums?.data?.find {
            it.attributes.name == spotifyAlbum.name && testArtistsMatch(it)
        }

        if (result != null) {
            return result
        }

        // try again with the title cleaned of remaster, deluxe, whatever info
        val cleanedTitle = cleanAlbumTitle(spotifyAlbum.name)
        results = searchWithTitle(cleanedTitle)
        result = results.albums?.data?.find {
            it.attributes.name.contains(cleanedTitle) && testArtistsMatch(it)
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

    private fun cleanAlbumTitle(title: String): String {
        // remove parentheticals containing these words
        val regex = """\(.*(Remaster|Deluxe|Collector).*\)""".toRegex()
        return title.replace(regex, "")
    }

    companion object {
        fun createAuthToken(privateKeyPath: String, keyId: String, teamId: String): String {
            val file = File(privateKeyPath)
            val pemParser = PEMParser(FileReader(file))
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
