describe("viewing a user's profile", () => {
  it('includes songs', () => {
    cy.login('jeff@jambuds.club');
    cy.visit('/users/vinny');

    cy.get('.playlist-item-row').contains('Drive');
  });

  it('includes mixtapes', () => {
    cy.login('jeff@jambuds.club');
    cy.visit('/users/vinny');

    cy.get('.playlist-item-row')
      .should('contain', "vinny's mixtape")
      .get('a[href="/mixtapes/1/vinny-s-mixtape"]');
  });

  it('works for logged-out users', () => {
    cy.visit('/users/vinny');
    cy.get('.share-banner').should('exist');
    cy.get('.playlist-item-row').contains('Drive');
  });
});
