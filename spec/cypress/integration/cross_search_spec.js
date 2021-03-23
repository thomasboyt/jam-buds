// TODO, maybe, some day - all of these should really not be UI tests! but I
// don't have anything set up for integration tests that aren't UI tests. these
// are fast enough for now.

describe('song cross-search', () => {
  it('cross-references apple and spotify', () => {
    // Twice - TT
    // Direct ISRC match (US5TA1600082)
    // https://open.spotify.com/track/60jFaQV7Z4boGC4ob5B5c6
    // https://music.apple.com/us/album/tt/1555401119?i=1555401122
    cy.login('jeff@jambuds.club');
    cy.visit('/?modal=new-jam');

    cy.get('[data-test="new-jam-field"]').clear().type('Twice TT');
    cy.get('button[type="submit"]').click();

    cy.contains('[data-test="search-results"] a', 'TT').click();
    cy.get('[data-test="service-spotify"]')
      .get('a[href="https://open.spotify.com/track/60jFaQV7Z4boGC4ob5B5c6"]')
      .should('exist');
    cy.get('[data-test="service-apple-music"]')
      .get(
        'a[href="https://music.apple.com/us/album/tt/1555401119?i=1555401122"]'
      )
      .should('exist');
  });

  it('works for bandcamp songs with isrc', () => {
    // Mr Twin Sister - In the House of Yes
    // Direct ISRC match (USA2B1401756)
    // https://mrtwinsister.bandcamp.com/track/in-the-house-of-yes
    // https://open.spotify.com/track/7eeNU3Zm56wzyl7MQDvEAH
    // https://music.apple.com/us/album/in-the-house-of-yes/905957630?i=905957637
    cy.login('jeff@jambuds.club');
    cy.visit('/?modal=new-jam');

    cy.get('[data-test="new-jam-field"]')
      .clear()
      .type('https://mrtwinsister.bandcamp.com/track/in-the-house-of-yes');
    cy.get('button[type="submit"]').click();

    cy.contains(
      '[data-test="search-results"] a',
      'In the House of Yes'
    ).click();
    cy.get('[data-test="service-spotify"]')
      .get('a[href="https://open.spotify.com/track/7eeNU3Zm56wzyl7MQDvEAH"]')
      .should('exist');
    cy.get('[data-test="service-apple-music"]')
      .get(
        'a[href="https://music.apple.com/us/album/in-the-house-of-yes/905957630?i=905957637"]'
      )
      .should('exist');
    cy.get('[data-test="service-bandcamp"]')
      .get(
        'a[href="https://mrtwinsister.bandcamp.com/track/in-the-house-of-yes"]'
      )
      .should('exist');
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
