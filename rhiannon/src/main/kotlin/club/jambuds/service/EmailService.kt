package club.jambuds.service

import club.jambuds.clients.EmailClient
import com.mitchellbosecke.pebble.PebbleEngine
import com.mitchellbosecke.pebble.loader.ClasspathLoader
import java.io.StringWriter

class EmailService(private val emailClient: EmailClient) {
    // some day, could move this to a TemplateService, if I want
    private val htmlEngine: PebbleEngine
    init {
        val loader = ClasspathLoader()
        loader.prefix = "templates/emails"
        loader.suffix = ".html"
        htmlEngine = PebbleEngine.Builder().loader(loader).build()
    }
    private val textEngine: PebbleEngine
    init {
        val loader = ClasspathLoader()
        loader.prefix = "templates/emails"
        loader.suffix = ".txt"
        textEngine = PebbleEngine.Builder().loader(loader).autoEscaping(false).build()
    }

    fun sendEmail(email: String, subject: String, templateName: String, data: Map<String, Any>) {
        val context = data.plus("subject" to subject)
        val html = buildTemplate(templateName, htmlEngine, context)
        val text = buildTemplate(templateName, textEngine, context)

        emailClient.sendEmail(
            fromEmail = "hello@jambuds.club",
            fromName = "Jam Buds",
            toEmail = email,
            subject = subject,
            htmlContent = html,
            textContent = text
        )
    }

    private fun buildTemplate(templateName: String, engine: PebbleEngine, context: Map<String, Any>): String {
        val template = engine.getTemplate(templateName)
        val writer = StringWriter()
        template.evaluate(writer, context)
        return writer.toString()
    }
}
