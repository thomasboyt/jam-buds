package club.jambuds.service

import club.jambuds.clients.AppleMusicClient
import club.jambuds.clients.AppleMusicSearchResult
import club.jambuds.clients.getAppleMusicGson
import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
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

    open fun getSongDetailsByIsrc(isrc: String): AppleMusicSearchResult? {
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

        return body.data[0]
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
