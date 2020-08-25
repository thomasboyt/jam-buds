package club.jambuds.service

import com.mitchellbosecke.pebble.PebbleEngine
import com.mitchellbosecke.pebble.loader.ClasspathLoader
import com.sendgrid.Method
import com.sendgrid.Request
import com.sendgrid.SendGrid
import com.sendgrid.helpers.mail.Mail
import com.sendgrid.helpers.mail.objects.Content
import com.sendgrid.helpers.mail.objects.Email
import org.slf4j.LoggerFactory
import java.io.StringWriter

class EmailService(private val disableEmail: Boolean, sgApiKey: String) {
    private val logger = LoggerFactory.getLogger(EmailService::class.java.name)

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

    private val sg = SendGrid(sgApiKey)

    fun sendEmail(email: String, subject: String, templateName: String, data: Map<String, Any>) {
        val context = data.plus("subject" to subject)
        val html = buildTemplate(templateName, htmlEngine, context)
        val text = buildTemplate(templateName, textEngine, context)

        if (disableEmail) {
            logger.info("\nSent message to $email:\n$subject\n---\n$text")
            // TODO: write email to disk for preview?
            return
        }

        val content = Content("text/plain", text)
        val mail = Mail(
            Email("hello@jambuds.club", "Jam Buds"),
            subject,
            Email(email),
            content
        )
        mail.addContent(Content("text/html", html))

        val req = Request()
        req.method = Method.POST
        req.endpoint = "mail/send"
        req.body = mail.build()

        // TODO: try actual emails to figure out error handling here...
        val resp = sg.api(req)
    }

    private fun buildTemplate(templateName: String, engine: PebbleEngine, context: Map<String, Any>): String {
        val template = engine.getTemplate(templateName)
        val writer = StringWriter()
        template.evaluate(writer, context)
        return writer.toString()
    }
}
