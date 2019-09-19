import expect from 'expect';

import { getPage } from '../support/browser';
import { asDevUser } from '../support/utils';

describe('viewing feed', function() {
  it('aggregates duplicate entries', async () => {
    const page = await getPage('/');
    await asDevUser(page, 'jeff');

    const firstEntryText: string = await page.$eval(
      '.playlist-entries li',
      (node) => (node as HTMLElement).innerText
    );

    expect(firstEntryText).toMatch('You and vinny posted');
  });
});
