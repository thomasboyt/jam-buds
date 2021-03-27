package club.jambuds.util

import club.jambuds.model.ItemSource
import club.jambuds.model.ItemType

object DirectUrlParser {
    val spotifyRe = Regex("""^https?://open\.spotify\.com/(album|track)/([A-z0-9-]+)""")
    val bandcampRe = Regex("""^https?://[A-z0-9-]+\.*bandcamp\.com/(album|track)/[A-z0-9-]+$""")
    val appleMusicRe = Regex("""^https?://(?:music|itunes).apple\.com/us/album/(?:[A-z0-9-]+)/([0-9]+)(?:\?i=([0-9]+))?""")

    data class DirectUrlParseResult(val type: ItemType, val source: ItemSource)
    fun parse(url: String): DirectUrlParseResult? {
        val spotifyType = spotifyUrlType(url)
        if (spotifyType != null) {
            return DirectUrlParseResult(spotifyType, ItemSource.SPOTIFY)
        }
        val appleMusicUrlType = appleMusicUrlType(url)
        if (appleMusicUrlType != null) {
            return DirectUrlParseResult(appleMusicUrlType, ItemSource.APPLEMUSIC)
        }
        val bandcampType = bandcampUrlType(url)
        if (bandcampType != null) {
            return DirectUrlParseResult(bandcampType, ItemSource.BANDCAMP)
        }
        return null
    }

    private fun spotifyUrlType(url: String): ItemType? {
        val match = spotifyRe.find(url)
            ?: return null
        val typeStr = match.groupValues[1]
        return when (typeStr) {
            "album" -> ItemType.ALBUM
            "track" -> ItemType.SONG
            else -> throw IllegalStateException()
        }
    }

    private fun appleMusicUrlType(url: String): ItemType? {
        val match = appleMusicRe.find(url)
            ?: return null
        return when (match.groupValues[2]) {
            "" -> ItemType.ALBUM
            else -> ItemType.SONG
        }
    }

    private fun bandcampUrlType(url: String): ItemType? {
        val match = bandcampRe.find(url)
            ?: return null
        val typeStr = match.groupValues[1]
        return when (typeStr) {
            "album" -> ItemType.ALBUM
            "track" -> ItemType.SONG
            else -> throw IllegalStateException()
        }
    }

    fun spotifyUrlId(url: String): String? {
        val match = spotifyRe.find(url)
            ?: return null
        return match.groupValues[2]
    }

    fun appleMusicUrlAlbumId(url: String): String? {
        val match = appleMusicRe.find(url)
            ?: return null
        return match.groupValues[1]
    }

    fun appleMusicUrlSongId(url: String): String? {
        val match = appleMusicRe.find(url)
            ?: return null
        return match.groupValues[2]
    }
}
