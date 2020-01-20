import io.ktor.http.*

data class JamBudsErrorResource(
    val message: String,
    val code: HttpStatusCode,
    // prevents this from being serialized:
    // https://stackoverflow.com/questions/56614483/specify-class-fields-to-be-serialized-to-json-in-ktor
    @Transient val request: String,
    @Transient val cause: Throwable? = null
)
