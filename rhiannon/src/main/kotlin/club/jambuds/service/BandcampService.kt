package club.jambuds.service

import club.jambuds.model.ItemType
import com.fasterxml.jackson.databind.ObjectMapper
import java.io.PrintWriter
import java.io.StringWriter
import java.lang.Exception
import org.jsoup.HttpStatusException
import org.jsoup.Jsoup
import org.jsoup.nodes.Document
import org.slf4j.LoggerFactory

data class BandcampSong(
    val title: String,
    val artist: String,
    val album: String,
    val albumArt: String,
    val isrc: String?,
    val bandcampId: String,
    val bandcampUrl: String,
    val bandcampStreamingAvailable: Boolean
    // TODO: maybe cache mp3 url here... depends on if we use embed
)

data class BandcampAlbum(
    val title: String,
    val artist: String,
    val albumArt: String,
    val bandcampUrl: String
)

open class BandcampService {
    private val logger = LoggerFactory.getLogger(BandcampService::class.java.name)

    private val timeout = 10000

    open fun getSongByUrl(url: String): BandcampSong? {
        val doc: Document = try {
            Jsoup.connect(url)
                .timeout(timeout)
                .get()
        } catch (err: HttpStatusException) {
            logger.error("Failed to fetch Bandcamp song: status ${err.statusCode} \n $err")
            return null
        } catch (err: Exception) {
            logger.error("Failed to fetch Bandcamp song: $err")
            return null
        }

        val script = doc.select("script[type=\"application/ld+json\"]").first()
        val jsonString = script?.data()
        if (jsonString == null) {
            logger.error("Failed to fetch Bandcamp song: Could not find metadata JSON in <head>")
            return null
        }

        val mapper = ObjectMapper()
        try {
            val node = mapper.readTree(jsonString)
            val title = node.get("name").asText()
            val artist = node.get("byArtist").get("name").asText()
            val album = node.get("inAlbum").get("name").asText()
            val image = node.get("image").asText()
            val canonicalUrl = node.get("@id").asText()
            val trackId = node.get("additionalProperty")
                .find { it.get("name").asText() == "track_id" }!!
                .get("value")
                .asLong()
                .toString()
            val streamingAvailable = node.get("additionalProperty")
                .find { it.get("name").asText() == "streaming" }
                ?.get("value")
                ?.asBoolean()
            val isrc = node.get("isrcCode")?.asText()
            return BandcampSong(
                title = title!!,
                bandcampUrl = canonicalUrl!!,
                bandcampId = trackId,
                albumArt = image!!,
                album = album!!,
                artist = artist!!,
                bandcampStreamingAvailable = streamingAvailable ?: false,
                isrc = isrc
            )
        } catch(err: Exception) {
            val trace = StringWriter().also { err.printStackTrace(PrintWriter(it)) }.toString().trim()
            logger.error("Failed to parse Bandcamp song JSON: $trace")
            return null
        }
    }

    open fun getAlbumByUrl(url: String): BandcampAlbum? {
        val doc: Document = try {
            Jsoup.connect(url)
                .timeout(timeout)
                .get()
        } catch (err: HttpStatusException) {
            logger.error("Failed to fetch Bandcamp album: status ${err.statusCode} \n $err")
            return null
        } catch (err: Exception) {
            logger.error("Failed to fetch Bandcamp album: $err")
            return null
        }

        val script = doc.select("script[type=\"application/ld+json\"]").first()
        val jsonString = script?.data()
        if (jsonString == null) {
            logger.error("Failed to fetch Bandcamp album: Could not find metadata JSON in <head>")
            return null
        }

        val mapper = ObjectMapper()
        try {
            val node = mapper.readTree(jsonString)
            val title = node.get("name").asText()
            val artist = node.get("byArtist").get("name").asText()
            val image = node.get("image").asText()
            val canonicalUrl = node.get("@id").asText()
            return BandcampAlbum(
                title = title!!,
                bandcampUrl = canonicalUrl!!,
                albumArt = image!!,
                artist = artist!!
            )
        } catch(err: Exception) {
            val trace = StringWriter().also { err.printStackTrace(PrintWriter(it)) }.toString().trim()
            logger.error("Failed to parse Bandcamp album JSON: $trace")
            return null
        }
    }

    fun bandcampUrlType(url: String): ItemType? {
        val re = Regex("""^https?://[A-z0-9-]+\.*bandcamp\.com/(album|track)/[A-z0-9-]+$""")
        val match = re.find(url)
            ?: return null
        val typeStr = match.groupValues[1]
        return when (typeStr) {
            "album" -> ItemType.ALBUM
            "track" -> ItemType.SONG
            else -> throw IllegalStateException()
        }
    }
}
