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

    cy.contains('abe posted');
  });

  it('shows that user a notification', () => {
    cy.login('jeff@jambuds.club');
    followAbe();

    cy.clearCookies();
    cy.login('abe@jambuds.club');
    cy.visit('/');

    cy.get('.notifications-panel')
      .should('contain', '1 new update since your last visit')
      .and('contain', 'jeff is now following you');

    cy.get('.notifications-panel .close-button').click();
    cy.get('.notifications-panel').should('not.exist');
  });
});
