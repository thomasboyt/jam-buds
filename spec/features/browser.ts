import * as puppeteer from 'puppeteer';

export let browser: puppeteer.Browser;

before(async () => {
  browser = await puppeteer.launch({
    headless: false,
  });
});
after(async () => {
  await browser.close();
});

const appUrl = (path: string) => `${process.env.APP_URL}${path}`;

export const getPage = async (url: string) => {
  const page = await browser.newPage();

  page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', (err) => {
    console.log('Error on page');
    console.log(err);
  });

  await page.goto(appUrl(url));

  return page;
};
