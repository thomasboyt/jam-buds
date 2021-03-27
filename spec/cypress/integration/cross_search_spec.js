// TODO, maybe, some day - all of these should really not be UI tests! but I
// don't have anything set up for integration tests that aren't UI tests. these
// are fast enough for now.

// Bartees Strange - Boomer
// Direct ISRC match (QMCE71302891)
const boomer = {
  query: 'Bartees Strange Boomer',
  title: 'Boomer',
  spotify: 'https://open.spotify.com/track/3hjaAXpqBfhoQa4I2MYRiv',
  apple: 'https://music.apple.com/us/album/boomer/1522995665?i=1522995860',
  // bandcamp: 'https://barteesstrange.bandcamp.com/track/boomer'
};

// Mr Twin Sister - In the House of Yes
// Direct ISRC match (USA2B1401756)
const inTheHouseOfYes = {
  spotify: 'https://open.spotify.com/track/7eeNU3Zm56wzyl7MQDvEAH',
  apple:
    'https://music.apple.com/us/album/in-the-house-of-yes/905957630?i=905957637',
  bandcamp: 'https://mrtwinsister.bandcamp.com/track/in-the-house-of-yes',
};

function expectResult(song) {
  cy.get('[data-test="service-spotify"]')
    .get(`a[href="${song.spotify}"]`)
    .should('exist');
  cy.get('[data-test="service-apple-music"]')
    .get(`a[href="${song.apple}"]`)
    .should('exist');
  if (song.bandcamp) {
    cy.get('[data-test="service-bandcamp"]')
      .get(`a[href="${song.bandcamp}"]`)
      .should('exist');
  }
}

describe('song cross-search', () => {
  it('cross-references apple and spotify', () => {
    cy.login('jeff@jambuds.club');
    cy.visit('/?modal=new-jam');

    cy.get('[data-test="new-jam-field"]').clear().type(boomer.query);
    cy.get('button[type="submit"]').click();

    cy.contains('[data-test="search-results"] a', boomer.title).click();
    expectResult(boomer);
  });

  it('works for spotify direct links', () => {
    cy.login('jeff@jambuds.club');
    cy.visit('/?modal=new-jam');

    cy.get('[data-test="new-jam-field"]').clear().type(boomer.spotify);
    cy.get('button[type="submit"]').click();

    cy.contains('[data-test="search-results"] a', boomer.title).click();
    expectResult(boomer);
  });

  it('works for apple direct links', () => {
    cy.login('jeff@jambuds.club');
    cy.visit('/?modal=new-jam');

    cy.get('[data-test="new-jam-field"]').clear().type(boomer.apple);
    cy.get('button[type="submit"]').click();

    cy.contains('[data-test="search-results"] a', boomer.title).click();
    expectResult(boomer);
  });

  it('works for bandcamp direct links (with isrc)', () => {
    cy.login('jeff@jambuds.club');
    cy.visit('/?modal=new-jam');

    cy.get('[data-test="new-jam-field"]').type(inTheHouseOfYes.bandcamp);
    cy.get('button[type="submit"]').click();

    cy.contains(
      '[data-test="search-results"] a',
      'In the House of Yes'
    ).click();
    expectResult(inTheHouseOfYes);
  });
});

describe('album cross-search', () => {
  it('fuzzy cross-searches apple and spotify', () => {
    // Tusk
    // Fuzzy match removing parentheticals
    // Spotify - Tusk (2015 Remaster) https://open.spotify.com/album/5FIN8pyPVx8ggNs5jQ86Re
    // Apple Music - Tusk (Remastered) https://music.apple.com/us/album/tusk-remastered/1055803853
    cy.login('jeff@jambuds.club');
    cy.visit('/?modal=new-jam');

    cy.get('button').contains('albums').click();
    cy.get('[data-test="new-jam-field"]').clear().type('Tusk Fleetwood Mac');
    cy.get('button[type="submit"]').click();

    cy.contains(
      '[data-test="search-results"] a',
      'Tusk (2015 Remaster)'
    ).click();
    cy.get('[data-test="service-spotify"]')
      .get('a[href="https://open.spotify.com/album/5FIN8pyPVx8ggNs5jQ86Re"]')
      .should('exist');
    cy.get('[data-test="service-apple-music"]')
      .get(
        'a[href="https://music.apple.com/us/album/tusk-remastered/1055803853"]'
      )
      .should('exist');
  });

  it('bandcamp: cross search works', () => {
    // Sweeping Promises - Hunger for a Way Out
    // Exact title match
    // https://sweepingpromises.bandcamp.com/album/hunger-for-a-way-out
    // https://open.spotify.com/album/0Cwh78WfxUMb1P8a7tIxYm
    // https://music.apple.com/us/album/hunger-for-a-way-out/1525204747
    cy.login('jeff@jambuds.club');
    cy.visit('/?modal=new-jam');

    cy.get('button').contains('albums').click();
    cy.get('[data-test="new-jam-field"]')
      .clear()
      .type('https://sweepingpromises.bandcamp.com/album/hunger-for-a-way-out');
    cy.get('button[type="submit"]').click();

    cy.contains(
      '[data-test="search-results"] a',
      'Hunger for a Way Out'
    ).click();
    cy.get('[data-test="service-spotify"]')
      .get('a[href="https://open.spotify.com/album/0Cwh78WfxUMb1P8a7tIxYm"]')
      .should('exist');
    cy.get('[data-test="service-apple-music"]')
      .get(
        'a[href="https://music.apple.com/us/album/hunger-for-a-way-out/1525204747"]'
      )
      .should('exist');
    cy.get('[data-test="service-bandcamp"]')
      .get(
        'a[href="https://sweepingpromises.bandcamp.com/album/hunger-for-a-way-out"]'
      )
      .should('exist');
  });
});
