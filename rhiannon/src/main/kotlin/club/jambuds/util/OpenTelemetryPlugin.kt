package club.jambuds.util

import io.javalin.Javalin
import io.javalin.core.plugin.Plugin
import io.javalin.http.HandlerEntry
import io.javalin.http.HandlerType
import io.opentelemetry.api.trace.Span
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse
import org.eclipse.jetty.server.Request
import org.eclipse.jetty.servlet.ServletHandler

class OpenTelemetryPlugin: Plugin {
    override fun apply(app: Javalin) {
        val server = app.server()?.server() ?: return

        val handler = object : ServletHandler() {
            override fun doHandle(
                target: String,
                baseRequest: Request,
                request: HttpServletRequest,
                response: HttpServletResponse
            ) {
                // logic via:
                // https://github.com/tipsy/javalin/blob/master/javalin/src/main/java/io/javalin/plugin/metrics/MicrometerPlugin.kt
                val uri = app.servlet()
                    .matcher
                    .findEntries(HandlerType.valueOf(request.method), request.pathInfo)
                    .stream()
                    .findAny()
                    .map(HandlerEntry::path)
                    .map { path: String -> if (path == "/" || path == "") "/" else path }
                    .orElse("NOT_FOUND")
                nextHandle(target, baseRequest, request, response)
                // we set the span name *after* handling the request or else it's overridden
                // later by the built-in jetty instrumentation
                val span = Span.current()
                span.updateName("${request.method} $uri")
                span.setAttribute("http.route", uri)
            }
        }
        server.insertHandler(handler)
    }
}
