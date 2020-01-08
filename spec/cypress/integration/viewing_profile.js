describe("viewing a user's profile", () => {
  it('includes songs', () => {
    cy.login('jeff@jambuds.club');
    cy.visit('/users/vinny');

    cy.get('.playlist-song').contains('Drive');
  });

  it('includes mixtapes', () => {
    cy.login('jeff@jambuds.club');
    cy.visit('/users/vinny');

    cy.get('.playlist-mixtape').contains("vinny's mixtape");
  });
});
