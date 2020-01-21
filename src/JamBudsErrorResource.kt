data class JamBudsErrorResource(
    val code: Int,
    val message: String?,
    // prevents this from being serialized:
    // https://stackoverflow.com/questions/56614483/specify-class-fields-to-be-serialized-to-json-in-ktor
    @Transient val request: String,
    @Transient val cause: Throwable? = null
)
