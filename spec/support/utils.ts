import puppeteer from 'puppeteer';

export async function asBigJeffrey(page: puppeteer.Page) {
  await page.evaluate(() => {
    (window as any).setDevUser('jeff');
  });
  // TODO: replace this with something faster?
  await page.waitFor(1000);
}
