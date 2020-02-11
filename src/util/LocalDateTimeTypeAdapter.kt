package util

import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import com.google.gson.TypeAdapter
import com.google.gson.stream.JsonReader
import com.google.gson.stream.JsonWriter

class LocalDateTimeTypeAdapter : TypeAdapter<LocalDateTime>() {
    override fun write(out: JsonWriter, value: LocalDateTime) {
        out.value(DateTimeFormatter.ISO_LOCAL_DATE_TIME.format(value))
    }
    override fun read(input: JsonReader): LocalDateTime = LocalDateTime.parse(input.nextString())
}
