import puppeteer from 'puppeteer';
import { login, appUrl } from './utils';

export let browser: puppeteer.Browser;

before(async () => {
  browser = await puppeteer.launch({
    // headless: false,
  });
});

after(async () => {
  await browser.close();
});

export const createPageSession = async (url: string, userEmail?: string) => {
  // close any existing pages since HMR can't handle more than like 3 open tabs
  const pages = await browser.pages();
  for (let page of pages) {
    await page.close();
  }

  const page = await browser.newPage();

  await page.setCacheEnabled(false);
  const client = await page.target().createCDPSession();
  await client.send('Network.clearBrowserCookies');
  await client.send('Network.clearBrowserCache');

  page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', (err) => {
    console.log('Error on page');
    console.log(err);
  });

  if (userEmail) {
    await login(page, userEmail);
  }

  await page.goto(appUrl(url));

  return page;
};
