describe('viewing feed', () => {
  it('aggregates duplicate entries', () => {
    cy.login('jeff@jambuds.club');
    cy.visit('/');

    const entry = cy
      .contains('[data-test="feed-entry-group"]', 'Drive')
      .should('contain', 'jeff')
      .and('contain', 'vinny');
  });

  it('includes mixtapes', () => {
    cy.login('jeff@jambuds.club');
    cy.visit('/');

    cy.get('.playlist-item-row')
      .should('contain', "vinny's mixtape")
      .get('a[href="/mixtapes/1/vinny-s-mixtape"]');
  });
});
