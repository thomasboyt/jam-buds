package club.jambuds.clients

import com.sendgrid.Method
import com.sendgrid.Request
import com.sendgrid.SendGrid
import com.sendgrid.helpers.mail.Mail
import com.sendgrid.helpers.mail.objects.Content
import com.sendgrid.helpers.mail.objects.Email
import org.slf4j.LoggerFactory

interface EmailClient {
    fun sendEmail(
        fromEmail: String,
        fromName: String,
        toEmail: String,
        subject: String,
        htmlContent: String,
        textContent: String
    )
}

class SendgridClient(sgApiKey: String) : EmailClient {
    private val sg = SendGrid(sgApiKey)

    override fun sendEmail(
        fromEmail: String,
        fromName: String,
        toEmail: String,
        subject: String,
        htmlContent: String,
        textContent: String
    ) {
        val content = Content("text/plain", textContent)
        val mail = Mail(
            Email(fromEmail, fromName),
            subject,
            Email(toEmail),
            content
        )
        mail.addContent(Content("text/html", htmlContent))

        val req = Request()
        req.method = Method.POST
        req.endpoint = "mail/send"
        req.body = mail.build()

        // TODO: try actual emails to figure out error handling here...
        val resp = sg.api(req)
    }
}

class DevEmailClient : EmailClient {
    private val logger = LoggerFactory.getLogger(DevEmailClient::class.java.name)

    override fun sendEmail(
        fromEmail: String,
        fromName: String,
        toEmail: String,
        subject: String,
        htmlContent: String,
        textContent: String
    ) {
        logger.info("\nSent message to $toEmail:\n$subject\n---\n$textContent")
        // TODO: write email to disk for preview?
        return
    }
}
