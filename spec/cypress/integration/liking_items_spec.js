describe('liking items', () => {
  it('liking a song works', () => {
    cy.login('jeff@jambuds.club');
    cy.visit('/');

    cy.contains('[data-test="feed-entry-group"]', 'Drive').as('post');

    cy.get('@post').find('button[data-test="like-button"]:visible').click();
    cy.get('@post').find('[data-test="like-count"]:visible').contains('1');

    // ensure displays on other pages after being locally-updated
    cy.get('[data-test="sidebar-link-profile"]').click();
    cy.contains('h1', 'jeff'); // page header
    cy.contains('[data-test="playlist-entry"]', 'Drive')
      .find('[data-test="like-count"]:visible')
      .contains('1');

    // ensure persists through reload
    cy.visit('/');
    cy.contains('[data-test="feed-entry-group"]', 'Drive')
      .find('[data-test="like-count"]:visible')
      .contains('1');

    // ensure creates like for other user
    cy.clearCookies();
    cy.login('vinny@jambuds.club');
    cy.visit('/');
    cy.get('.notifications-button .notifications-dot').should('exist');
    cy.get('.sidebar .notifications-button').click();
    cy.get('.modal').should(
      'contain',
      'jeff liked the song "Drive" via your post'
    );
  });
});
