import expect from 'expect';
import puppeteer from 'puppeteer';

import { getPage } from '../support/browser';
import { asBigJeffrey } from '../support/utils';
import '../support/mochaHooks';

const findSong = async (page: puppeteer.Page, content: string) =>
  (await page.$x(
    `//ul[@class='playlist-entries']/li[contains(., '${content}')]`
  ))[0];

const deleteSong = async (page: puppeteer.Page, content: string) => {
  const el = await findSong(page, content);

  el.$eval('.menu-container .action-button', (node: HTMLElement) =>
    node.click()
  );

  page.on('dialog', (dialog) => {
    dialog.accept();
  });

  await el.$eval('button[data-test="delete-song"]', (node: HTMLElement) =>
    node.click()
  );

  await page.waitFor(500);
};

describe('deleting songs', function() {
  it('removes a song from feed when song was only posted by you', async () => {
    const page = await getPage('/');
    await asBigJeffrey(page);

    await deleteSong(page, 'The Chemical Brothers');

    let chemBros = await findSong(page, 'The Chemical Brothers');
    expect(chemBros).toBeUndefined();
  });

  it("removes your name from a song's post in your feed if you were one of several posters", async () => {
    const page = await getPage('/');
    await asBigJeffrey(page);

    await deleteSong(page, 'Drive');
    let drive = await findSong(page, 'Drive');

    const postedText = await drive.$eval(
      '.posted-by',
      (node: HTMLElement) => node.innerText
    );

    expect(postedText).toMatch(/^vinny posted/);
  });

  it('removes song from your playlist when deleted from playlist screen', async () => {
    const page = await getPage('/users/jeff');
    await asBigJeffrey(page);

    await deleteSong(page, 'The Chemical Brothers');

    let chemBros = await findSong(page, 'The Chemical Brothers');
    expect(chemBros).toBeUndefined();
  });
});
