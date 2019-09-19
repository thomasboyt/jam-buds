import expect from 'expect';
import expectPuppeteer from 'expect-puppeteer';

import { getPage } from '../support/browser';
import { asDevUser } from '../support/utils';
import '../support/mochaHooks';

async function followAbe() {
  const page = await getPage('/users/abe');
  await asDevUser(page, 'jeff');

  await expectPuppeteer(page).toClick('.follow-toggle');

  await expectPuppeteer(page).toMatchElement('.follow-toggle', {
    text: 'Unfollow',
    timeout: 1000,
  });
}

describe('following a user', () => {
  it('displays their entries in your feed', async () => {
    await followAbe();

    const page = await getPage('/');

    await expectPuppeteer(page).toMatch('abe posted');
  });

  it('shows that user a notification', async () => {
    await followAbe();

    const page = await getPage('/');
    await asDevUser(page, 'abe');

    await expectPuppeteer(page).toMatch('1 new update since your last visit');
    await expectPuppeteer(page).toMatch('jeff is now following');

    // this should probably live in its own spec, but eh
    await expectPuppeteer(page).toClick('.notifications-panel .close-button');

    expect(await page.$('.notifications-panel')).toBe(null);
  });
});
