function followAbe() {
  cy.visit('/users/abe');
  cy.get('.follow-toggle').click();
  cy.get('.follow-toggle').contains('Unfollow');
}

describe('following a user', () => {
  it('displays their entries in your feed', () => {
    cy.login('jeff@jambuds.club');
    followAbe();

    cy.visit('/');

    cy.get('.entry-details').contains('abe');
  });

  it('shows that user a notification', () => {
    cy.login('jeff@jambuds.club');
    followAbe();

    cy.clearCookies();
    cy.login('abe@jambuds.club');
    cy.visit('/');

    cy.get('.notifications-button .notifications-dot').should('exist');
    cy.get('.sidebar .notifications-button').click();

    cy.get('.modal').should('contain', 'jeff is now following you');

    // TODO: move this to some kinda notifications test
    cy.get('.modal li').click();
    cy.url().should('include', '/users/jeff');
    cy.get('.notifications-button .notifications-dot').should('not.be.visible');
  });
});
