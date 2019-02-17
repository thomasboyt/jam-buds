import { writeFileSync } from 'fs';
import nunjucks from 'nunjucks';
import sgMail from '@sendgrid/mail';

nunjucks.configure('emails');

interface BaseTemplateOptions {
  templateName: string;
}

interface SignUpTemplateOptions {
  templateName: 'sign-up';
  data: {
    registrationLink: string;
  };
}

interface LogInTemplateOptions {
  templateName: 'log-in';
  data: {
    name: string;
    logInLink: string;
  };
}

type TemplateOptions = SignUpTemplateOptions | LogInTemplateOptions;

function renderHtml(templateOptions: TemplateOptions, subject: string) {
  const name = `${templateOptions.templateName}.html`;
  return nunjucks.render(name, {
    ...templateOptions.data,
    subject,
  });
}

function renderTxt(templateOptions: TemplateOptions) {
  const name = `${templateOptions.templateName}.txt`;
  return nunjucks.render(name, templateOptions.data);
}

export async function sendEmail(
  recipientEmail: string,
  subject: string,
  templateOptions: TemplateOptions
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
      text: renderTxt(templateOptions),
      html: renderHtml(templateOptions, subject),
    };

    await sgMail.send(msg);
  } else {
    console.log(`\n*** sending email to ${recipientEmail}: ${subject}`);
    console.log(renderTxt(templateOptions));
    console.log('');
  }
}
