import expect from 'expect';
import expectPuppeteer from 'expect-puppeteer';

import { getPage } from '../support/browser';
import { asDevUser } from '../support/utils';

describe("viewing a user's profile", function() {
  it('includes songs', async () => {
    const page = await getPage('/users/vinny');
    await asDevUser(page, 'jeff');

    await expectPuppeteer(page).toMatchElement('.playlist-song', {
      text: 'Drive',
    });
  });

  it('includes mixtapes', async () => {
    const page = await getPage('/users/vinny');
    await asDevUser(page, 'jeff');

    await expectPuppeteer(page).toMatchElement('.playlist-mixtape', {
      text: "vinny's mixtape",
    });
  });
});
