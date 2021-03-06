describe('registration', () => {
  it('creates a new account and takes you to your feed', () => {
    cy.visit('/');

    cy.get('[data-test="get-started-button"]').click();
    cy.get('input[type="email"]').type('newuser@jambuds.club');
    cy.get('button[type="submit"]').click();

    cy.contains('welcome!');

    cy.get('input.url-name').type('newuser');
    cy.get('button[type="submit"]').click();

    cy.contains('connect a streaming service');
    cy.contains('continue without connecting').click();

    cy.get('[data-test="connect-twitter"]')
      .should('contain', 'connect to twitter')
      .contains('continue without connecting')
      .click();

    cy.contains('your feed');
  });
});
