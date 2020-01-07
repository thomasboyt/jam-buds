import expect from 'expect';
import expectPuppeteer from 'expect-puppeteer';

import { createPageSession } from '../support/browser';

describe('viewing feed', function() {
  it('aggregates duplicate entries', async () => {
    const page = await createPageSession('/', 'jeff@jambuds.club');

    const entriesText: string[] = await page.$$eval(
      '.playlist-entries li',
      (nodes) => nodes.map((node) => (node as HTMLElement).innerText)
    );

    const driveEntries = entriesText.filter((entry) => entry.includes('Drive'));
    expect(driveEntries.length).toBe(1);
    expect(driveEntries[0]).toMatch('You and vinny posted');
  });

  it('includes mixtapes', async () => {
    const page = await createPageSession('/', 'jeff@jambuds.club');

    await expectPuppeteer(page).toMatchElement('.playlist-mixtape', {
      text: "vinny's mixtape",
    });
  });
});
