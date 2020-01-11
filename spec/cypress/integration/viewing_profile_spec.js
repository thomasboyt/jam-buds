describe("viewing a user's profile", () => {
  it('includes songs', () => {
    cy.login('jeff@jambuds.club');
    cy.visit('/users/vinny');

    cy.get('.playlist-song').contains('Drive');
  });

  it('includes mixtapes', () => {
    cy.login('jeff@jambuds.club');
    cy.visit('/users/vinny');

    cy.get('.playlist-mixtape')
      .should('contain', "vinny's mixtape")
      .get('a[href="/mixtapes/1/vinny-s-mixtape"]');
  });
});
