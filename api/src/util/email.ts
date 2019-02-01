export async function sendEmail(
  recipientEmail: string,
  subject: string,
  content: string
) {
  if (process.env.NODE_ENV === 'production') {
    // TODO
  } else {
    console.log('\n');
    console.log(`*** sending email to ${recipientEmail}: ${subject}`);
    console.log(content);
    console.log('\n');
  }
}
