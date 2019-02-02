import * as sgMail from '@sendgrid/mail';

export async function sendEmail(
  recipientEmail: string,
  subject: string,
  content: string
) {
  if (process.env.NODE_ENV === 'production') {
    const key = process.env.SENDGRID_API_KEY;

    if (!key) {
      throw new Error('Tried to send email, but missing SENDGRID_API_KEY!');
    }

    sgMail.setApiKey(key);

    const msg = {
      to: recipientEmail,
      from: 'hello@jambuds.club',
      subject,
      text: content,
    };

    await sgMail.send(msg);
  } else {
    console.log(`\n*** sending email to ${recipientEmail}: ${subject}`);
    console.log(content);
    console.log('');
  }
}
