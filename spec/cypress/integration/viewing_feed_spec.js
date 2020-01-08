describe('viewing feed', () => {
  it('aggregates duplicate entries', () => {
    cy.login('jeff@jambuds.club');
    cy.visit('/');

    cy.get('.playlist-entries li')
      .contains('Drive')
      .contains('You and vinny posted');
  });

  it('includes mixtapes', () => {
    cy.login('jeff@jambuds.club');
    cy.visit('/');

    cy.get('.playlist-mixtape').contains("vinny's mixtape");
  });
});
