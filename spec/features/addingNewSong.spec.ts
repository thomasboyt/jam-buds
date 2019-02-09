import expect from 'expect';
import puppeteer from 'puppeteer';

import { getPage } from './browser';
import './mochaHooks';

async function asBigJeffrey(page: puppeteer.Page) {
  await page.evaluate(() => {
    (window as any).setDevUser('jeff');
  });
  // TODO: replace this with something faster?
  await page.waitFor(1000);
}

async function searchForSong(page: puppeteer.Page, query: string) {
  await page.waitFor('[data-test="add-song"]');
  await page.click('[data-test="add-song"]');
  await page.type('[data-test="song-url-field"]', query);

  // XXX: Seems to fix an issue where the button takes a frame to update to
  // clickable
  await page.waitFor(100);

  await page.click('button[type="submit"]');
}

async function expectPlaylistEntry(page: puppeteer.Page, text: string) {
  await page.waitFor(1000); // eh

  const exists = await page.$$eval(
    '.playlist-entry',
    (entries, text) => {
      return Array.from(entries).some(
        (entry) => !!entry.innerHTML.match(new RegExp(text))
      );
    },
    text
  );

  expect(exists).toBe(true);
}

describe('posting a new song', function() {
  this.timeout(10000);

  describe('via spotify', () => {
    it('creates an entry in your feed', async () => {
      const page = await getPage('/');

      await asBigJeffrey(page);

      await searchForSong(page, 'Kanye Wolves');

      await page.waitFor('[data-test="search-results"]');

      const results = await page.$('[data-test="search-results"]');
      const wolvesLink = (await results!.$x(
        "//a[contains(text(), 'Kanye West')]"
      ))[0];

      await wolvesLink.click();

      await page.waitFor('[data-test="add-song-confirm"]');
      await page.click('[data-test="add-song-confirm"]');

      await expectPlaylistEntry(page, 'Wolves');
    });
  });
});
