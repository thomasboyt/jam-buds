import expect from 'expect';
import puppeteer from 'puppeteer';

import { createPageSession } from '../support/browser';
import '../support/mochaHooks';

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
    '.playlist-song',
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
  describe('via spotify', () => {
    it('creates an entry in your feed', async () => {
      const page = await createPageSession('/', 'jeff@jambuds.club');

      await searchForSong(page, 'Kanye Wolves');

      await page.waitFor('[data-test="search-results"]');

      const results = await page.$('[data-test="search-results"]');
      const wolvesLink = (await results!.$x(
        "//a[contains(., 'Kanye West')][contains(., 'Wolves')]"
      ))[0];

      await wolvesLink.click();

      await page.waitFor('[data-test="add-song-confirm"]');
      await page.click('[data-test="add-song-confirm"]');

      await expectPlaylistEntry(page, 'Wolves');
    });
  });
});
