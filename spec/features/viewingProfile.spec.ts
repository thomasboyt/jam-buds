import expectPuppeteer from 'expect-puppeteer';

import { createPageSession } from '../support/browser';

describe("viewing a user's profile", function() {
  it('includes songs', async () => {
    const page = await createPageSession('/users/vinny', 'jeff@jambuds.club');

    await expectPuppeteer(page).toMatchElement('.playlist-song', {
      text: 'Drive',
    });
  });

  it('includes mixtapes', async () => {
    const page = await createPageSession('/users/vinny', 'jeff@jambuds.club');

    await expectPuppeteer(page).toMatchElement('.playlist-mixtape', {
      text: "vinny's mixtape",
    });
  });
});
