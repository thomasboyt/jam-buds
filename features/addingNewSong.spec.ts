/// <reference types="mocha" />
/// <reference types="webdriverio" />

import * as expect from 'expect';

import './mochaHooks';

describe('posting a new song', () => {
  it('creates an entry in your feed', () => {
    browser.url('/');
    browser.waitForExist('[data-reactroot]');

    // log in
    browser.execute(() => {
      (window as any).setDevUser('jeffgerstmann');
    });

    browser.click('[data-test="add-song"]');
    browser.setValue('[data-test="song-url-field"]', 'https://www.youtube.com/watch?v=S-sJp1FfG7Q');
    browser.submitForm('[data-test="song-url-field"]');

    browser.setValue('[data-test="song-search-field"]', 'Bad and Boujee');
    browser.submitForm('[data-test="song-search-field"]');

    browser.click('*=Migos');

    browser.click('[data-test="add-song-confirm"]');

    expect(browser.element('.playlist-entry*=Bad and Boujee')).toExist();
  });

  // it('supports manual entry', () => {
  // });

  // it('supports bandcamp', () => {
  // });
});