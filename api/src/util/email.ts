import { writeFileSync, mkdirSync } from 'fs';
import * as path from 'path';
import nunjucks from 'nunjucks';
import sgMail from '@sendgrid/mail';
import juice from 'juice';

import config from '../config';

function writeEmailToDisk(subject: string, html: string) {
  const date = new Date().toISOString();
  const folder = path.join(__dirname, '../../../tmp/emails');
  const filename = path.join(folder, `${date} - ${subject}.html`);

  mkdirSync(folder, { recursive: true });
  writeFileSync(filename, html, { encoding: 'utf8' });
}

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
  return juice(
    nunjucks.render(name, {
      ...templateOptions.data,
      subject,
    })
  );
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
  const html = renderHtml(templateOptions, subject);

  if (config.get('NODE_ENV') === 'production') {
    const key = config.require('SENDGRID_API_KEY');

    if (!key) {
      throw new Error('Tried to send email, but missing SENDGRID_API_KEY!');
    }

    sgMail.setApiKey(key);

    const msg = {
      to: recipientEmail,
      from: {
        email: 'hello@jambuds.club',
        name: 'Jam Buds',
      },
      subject,
      text: renderTxt(templateOptions),
      html,
    };

    await sgMail.send(msg);
  } else if (config.get('NODE_ENV') !== 'test') {
    console.log(`\n*** sending email to ${recipientEmail}: ${subject}`);
    console.log(renderTxt(templateOptions));
    console.log('');
    writeEmailToDisk(subject, html);
  }
}
