describe('deleting songs', () => {
  function deleteSong(search) {
    cy.on('window:confirm', () => true);

    cy.contains('[data-test="playlist-entry"]', search)
      .next('.entry-details')
      .find('button[data-test="remove-button"]')
      .click();
  }

  it('removes a song from feed when song was only posted by you', () => {
    cy.login('jeff@jambuds.club');
    cy.visit('/');

    deleteSong('The Chemical Brothers');

    cy.contains('[data-test="playlist-entry"]', 'The Chemical Brothers').should(
      'not.exist'
    );
  });

  it("removes your name from a song's post in your feed if you were one of several posters", () => {
    cy.login('jeff@jambuds.club');
    cy.visit('/');

    deleteSong('Drive');

    cy.contains('[data-test="feed-entry-group"]', 'Drive')
      .and('not.contain', 'jeff')
      .and('contain', 'vinny');
  });

  it('removes song from your playlist when deleted from playlist screen', () => {
    cy.login('jeff@jambuds.club');
    cy.visit('/users/jeff');

    deleteSong('The Chemical Brothers');

    cy.contains('[data-test="playlist-entry"]', 'The Chemical Brothers').should(
      'not.exist'
    );
  });
});
