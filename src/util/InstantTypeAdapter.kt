package util

import java.time.Instant
import java.time.format.DateTimeFormatter
import com.google.gson.TypeAdapter
import com.google.gson.stream.JsonReader
import com.google.gson.stream.JsonWriter

class InstantTypeAdapter : TypeAdapter<Instant>() {
    override fun write(out: JsonWriter, value: Instant) {
        out.value(DateTimeFormatter.ISO_INSTANT.format(value))
    }
    override fun read(input: JsonReader): Instant = Instant.parse(input.nextString())
}
