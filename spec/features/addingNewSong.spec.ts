import * as expect from 'expect';
import * as puppeteer from 'puppeteer';

import {getPage} from './browser';
import './mochaHooks';

async function asBigJeffrey(page: puppeteer.Page) {
  await page.evaluate(() => {
    (window as any).setDevUser('jeffgerstmann');
  });
  // TODO: replace this with something faster?
  await page.waitFor(1000);
}

async function submitSong(page: puppeteer.Page, url: string) {
  await page.waitFor('[data-test="add-song"]')
  await page.click('[data-test="add-song"]');
  await page.type('[data-test="song-url-field"]', url);
  await page.click('button[type="submit"]');
}

async function expectPlaylistEntry(page: puppeteer.Page, text: string) {
  await page.waitFor(1000);  // eh

  const exists = await page.$$eval('.playlist-entry', (entries, text) => {
    return Array.from(entries).some((entry) => !!entry.innerHTML.match(new RegExp(text)));
  }, text);

  expect(exists).toBe(true);
}
describe('posting a new song', function() {
  this.timeout(30000);

  describe('via youtube', () => {
    it('creates an entry in your feed', async () => {
      const page = await getPage('/');

      await asBigJeffrey(page);

      await submitSong(page, 'https://www.youtube.com/watch?v=S-sJp1FfG7Q');

      await page.waitFor('[data-test="song-search-field"]');
      await page.type('[data-test="song-search-field"]', 'Bad and Boujee');
      await page.click('button[type="submit"]');  // TODO: this sometimes doesn't work?

      await page.waitFor('[data-test="search-results"]')

      const results = await page.$('[data-test="search-results"]');
      const migosLink = (await results!.$x("//a[contains(text(), 'Migos')]"))[0];

      await migosLink.click();

      await page.waitFor('[data-test="add-song-confirm"]');
      await page.click('[data-test="add-song-confirm"]');

      await expectPlaylistEntry(page, 'Bad and Boujee');
    });

    it('supports manual entry', async () => {
      const page = await getPage('/');

      await asBigJeffrey(page);

      await submitSong(page, 'https://www.youtube.com/watch?v=S-sJp1FfG7Q');

      await page.waitFor('[data-test="use-manual-entry"]')
      await page.click('[data-test="use-manual-entry"]');

      await page.type('[name="title"]', 'Bad and Boujee');
      await page.type('[name="artist"]', 'Migos');
      await page.click('button[type="submit"]');

      await page.click('[data-test="add-song-confirm"]');

      await expectPlaylistEntry(page, 'Bad and Boujee');
    });
  });

  describe('via bandcamp', () => {
    it('autopopulates song title/artist from spotify', async () => {
      const page = await getPage('/');

      await asBigJeffrey(page);

      await submitSong(page, 'https://m-e-l-e-e.bandcamp.com/track/i-dont-know-why');

      await page.waitFor('[data-test="add-song-confirm"]');
      await page.click('[data-test="add-song-confirm"]');

      await expectPlaylistEntry(page, 'Melee');
    });

    it('supports manual entry', async () => {
      const page = await getPage('/');

      await asBigJeffrey(page);

      await submitSong(page, 'https://fieldbalm.bandcamp.com/track/quilted');

      await page.waitFor('[name="title"]');
      const title = await page.$eval('[name="title"]', (el) => (el as HTMLInputElement).value);
      const artist = await page.$eval('[name="artist"]', (el) => (el as HTMLInputElement).value);
      expect(title).toEqual('quilted')
      expect(artist).toEqual('field balm');
      await page.click('button[type="submit"]');

      await page.click('[data-test="add-song-confirm"]');
      await expectPlaylistEntry(page, 'quilted');
    });
  })
});