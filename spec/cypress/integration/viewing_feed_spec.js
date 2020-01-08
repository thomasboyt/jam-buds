describe('viewing feed', () => {
  it('aggregates duplicate entries', () => {
    cy.login('jeff@jambuds.club');
    cy.visit('/');

    cy.get('.playlist-entries li')
      .should('contain', 'Drive')
      .and('contain', 'You and vinny posted');
  });

  it('includes mixtapes', () => {
    cy.login('jeff@jambuds.club');
    cy.visit('/');

    cy.get('.playlist-mixtape').contains("vinny's mixtape");
  });
});
