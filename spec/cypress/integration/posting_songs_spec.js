describe('posting a new song', () => {
  it('creates an entry in your feed', () => {
    cy.login('jeff@jambuds.club');
    cy.visit('/');

    cy.get('[data-test="add-song"]:visible').click();

    cy.get('[data-test="song-url-field"]').clear().type('Twice');
    cy.get('button[type="submit"]').click();

    cy.contains('[data-test="search-results"] a', 'TT').click();

    cy.get('[data-test="note-field"]').type('some thoughts about this song');

    cy.get('[data-test="add-song-confirm"]').click();

    cy.contains('.playlist-song', 'TT').and('contain', 'TWICE');
    cy.contains('.note-text', 'some thoughts about this song');
  });
});
