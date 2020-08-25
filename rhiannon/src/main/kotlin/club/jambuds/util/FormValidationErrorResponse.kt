package club.jambuds.util

import io.javalin.http.HttpResponseException
import org.eclipse.jetty.http.HttpStatus

/**
 * I'd like to support multiple errors for a single field, but since "details" on a Javalin
 * HttpResponseException can only be a Map<String, String>, we're limited to just a 1:1 for now.
 * The "last error" for a field wins.
 */
private fun transformErrors(errors: List<Pair<String, String>>): Map<String, String> {
    return errors.toMap()
}

class FormValidationErrorResponse(errors: List<Pair<String, String>>) :
    HttpResponseException(HttpStatus.BAD_REQUEST_400, "Bad request", transformErrors(errors))
