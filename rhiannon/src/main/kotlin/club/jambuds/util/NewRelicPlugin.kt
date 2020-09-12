package club.jambuds.util

import com.newrelic.api.agent.NewRelic
import io.javalin.Javalin
import io.javalin.core.plugin.Plugin
import io.javalin.http.HandlerEntry
import io.javalin.http.HandlerType
import org.eclipse.jetty.server.Request
import org.eclipse.jetty.servlet.ServletHandler
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

class NewRelicPlugin: Plugin {
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
                NewRelic.setTransactionName(null, "${request.method} ${uri}")
                nextHandle(target, baseRequest, request, response)
            }
        }
        server.insertHandler(handler)
    }
}
