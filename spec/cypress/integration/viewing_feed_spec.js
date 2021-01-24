describe('viewing feed', () => {
  it('aggregates duplicate entries', () => {
    cy.login('jeff@jambuds.club');
    cy.visit('/');

    cy.get('[data-test="playlist-entry"]')
      .should('contain', 'Drive')
      .and('contain', 'jeff')
      .and('contain', 'vinny');
  });

  it('includes mixtapes', () => {
    cy.login('jeff@jambuds.club');
    cy.visit('/');

    cy.get('.playlist-mixtape')
      .should('contain', "vinny's mixtape")
      .get('a[href="/mixtapes/1/vinny-s-mixtape"]');
  });
});
