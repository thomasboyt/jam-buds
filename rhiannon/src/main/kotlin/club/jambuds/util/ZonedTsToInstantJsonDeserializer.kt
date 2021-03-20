package club.jambuds.util

import com.fasterxml.jackson.core.JsonParser
import com.fasterxml.jackson.databind.DeserializationContext
import com.fasterxml.jackson.databind.JsonDeserializer
import java.time.Instant
import java.time.ZonedDateTime

object ZonedTsToInstantJsonDeserializer : JsonDeserializer<Instant>() {
    override fun deserialize(p: JsonParser, ctx: DeserializationContext): Instant {
        val str = p.readValueAs(String::class.java)
        return ZonedDateTime.parse(str).toInstant()
    }
}
