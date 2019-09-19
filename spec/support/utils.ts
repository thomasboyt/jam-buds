import puppeteer from 'puppeteer';

export async function asDevUser(page: puppeteer.Page, user: string) {
  await page.evaluate((user) => {
    (window as any).setDevUser(user);
  }, user);
  // TODO: replace this with something faster?
  await page.waitFor(1000);
}
