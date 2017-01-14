/// <reference types="mocha" />
/// <reference types="webdriverio" />

import * as expect from 'expect';

import './mochaHooks';

function asBigJeffrey(browser: WebdriverIO.Client<any>) {
  browser.waitForExist('[data-reactroot]');
  browser.execute(() => {
    (window as any).setDevUser('jeffgerstmann');
  });
}

function submitSong(browser: WebdriverIO.Client<any>, url: string) {
  browser.click('[data-test="add-song"]');
  browser.setValue('[data-test="song-url-field"]', url);
  browser.submitForm('[data-test="song-url-field"]');
}

describe('posting a new song', () => {
  describe('via youtube', () => {
    it('creates an entry in your feed', () => {
      browser.url('/');

      asBigJeffrey(browser);

      submitSong(browser, 'https://www.youtube.com/watch?v=S-sJp1FfG7Q');

      browser.setValue('[data-test="song-search-field"]', 'Bad and Boujee');
      browser.submitForm('[data-test="song-search-field"]');

      browser.click('*=Migos');

      browser.click('[data-test="add-song-confirm"]');

      expect(browser.element('.playlist-entry*=Bad and Boujee')).toExist();
    });

    it('supports manual entry', () => {
      browser.url('/');

      asBigJeffrey(browser);

      submitSong(browser, 'https://www.youtube.com/watch?v=S-sJp1FfG7Q');

      browser.click('[data-test="use-manual-entry"]');

      browser.setValue('[name="title"]', 'Bad and Boujee');
      browser.setValue('[name="artist"]', 'Migos');
      browser.submitForm('[name="artist"]');

      browser.click('[data-test="add-song-confirm"]');
      expect(browser.element('.playlist-entry*=Bad and Boujee')).toExist();
    });
  });

  describe('via bandcamp', () => {
    it('autopopulates song title/artist from spotify', () => {
      browser.url('/');

      asBigJeffrey(browser);

      submitSong(browser, 'https://m-e-l-e-e.bandcamp.com/track/i-dont-know-why');

      browser.click('[data-test="add-song-confirm"]');

      expect(browser.element('.playlist-entry*=I Don\'t Know Why')).toExist();
    });

    it('supports manual entry', () => {
      browser.url('/');

      asBigJeffrey(browser);

      submitSong(browser, 'https://fieldbalm.bandcamp.com/track/quilted');

      expect(browser.getValue('[name="title"]')).toBe('quilted')
      expect(browser.getValue('[name="artist"]')).toBe('field balm');
      browser.submitForm('[name="artist"]');

      browser.click('[data-test="add-song-confirm"]');
      expect(browser.element('.playlist-entry*=quilted')).toExist();
    });
  })
});