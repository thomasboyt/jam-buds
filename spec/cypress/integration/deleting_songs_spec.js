describe('deleting songs', () => {
  function deleteSong(search) {
    cy.contains('ul.playlist-entries li', search)
      .as('post')
      .find('.menu-container .action-button')
      .click();

    cy.get('@post')
      .find('button[data-test="delete-song"]')
      .click();
  }

  it('removes a song from feed when song was only posted by you', () => {
    cy.login('jeff@jambuds.club');
    cy.visit('/');

    cy.on('window:confirm', () => true);

    deleteSong('The Chemical Brothers');

    cy.contains('ul.playlist-entries li', 'The Chemical Brothers').should(
      'not.exist'
    );
  });

  it("removes your name from a song's post in your feed if you were one of several posters", () => {
    cy.login('jeff@jambuds.club');
    cy.visit('/');

    cy.on('window:confirm', () => true);

    deleteSong('Drive');

    cy.contains('ul.playlist-entries li', 'Drive')
      .find('.posted-by')
      .and('contain', 'vinny')
      .and('not.contain', 'You');
  });

  it('removes song from your playlist when deleted from playlist screen', () => {
    cy.login('jeff@jambuds.club');
    cy.visit('/users/jeff');

    cy.on('window:confirm', () => true);

    deleteSong('The Chemical Brothers');

    cy.contains('ul.playlist-entries li', 'The Chemical Brothers').should(
      'not.exist'
    );
  });
});
