import puppeteer from 'puppeteer';

export const appUrl = (path: string) => `${process.env.APP_URL}${path}`;

export async function login(page: puppeteer.Page, email: string) {
  await page.goto(appUrl('/'));

  await page.type('input[type="email"]', email);
  await page.click('button[type="submit"]');

  // TODO: replace this with something faster?
  await page.waitFor(1000);
}
