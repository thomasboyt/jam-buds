describe('creating mixtapes', () => {
  it('directs you to a new mixtape', () => {
    cy.login('jeff@jambuds.club');
    cy.visit('/');

    cy.get('[data-test="post-jam-button"]:visible').click();
    cy.get('button').contains('mixtapes').click();
    cy.get('[data-test="new-jam-field"]').clear().type('jefftape');
    cy.get('button[type="submit"]').click();

    cy.url().should('match', /\/mixtapes\/(.*)\/jefftape$/);
  });
});

describe('editing mixtapes', () => {
  beforeEach(() => {
    cy.login('jeff@jambuds.club');
    cy.visit('/');
    cy.get('[data-test="post-jam-button"]:visible').click();
    cy.get('button').contains('mixtapes').click();
    cy.get('[data-test="new-jam-field"]').clear().type('jefftape');
    cy.get('button[type="submit"]').click();

    cy.url()
      .should('match', /\/mixtapes\/(.*)\/jefftape$/)
      .then((url) => {
        const id = url.match(/\/mixtapes\/(.*)\/jefftape$/)[1];
        return id;
      })
      .as('mixtapeId');
  });

  it('updates the mixtape title', function () {
    cy.get('button.enter-button').click();

    cy.get('.title-input').clear().type('Updated Title');

    cy.get('button.save-button').click();

    cy.url().should('include', `/mixtapes/${this.mixtapeId}/updated-title`);
    cy.contains('Updated Title');
  });

  it('adds new songs', () => {
    cy.get('[data-test="post-jam-button"]:visible').click();

    cy.get('[data-test="new-jam-field"]').clear().type('Twice');
    cy.get('button[type="submit"]').click();
    cy.contains('[data-test="search-results"] a', 'TT').click();
    cy.get('[data-test="new-jam-confirm"]').click();

    cy.contains('.playlist-item-row', 'TT').and('contain', 'TWICE');
  });

  it('allows publishing', () => {
    cy.get('[data-test="post-jam-button"]:visible').click();
    cy.get('[data-test="new-jam-field"]').clear().type('Twice');
    cy.get('button[type="submit"]').click();
    cy.contains('[data-test="search-results"] a', 'TT').click();
    cy.get('[data-test="new-jam-confirm"]').click();
    cy.contains('.playlist-item-row', 'TT').and('contain', 'TWICE');
    cy.get('.publish-button').click();

    cy.visit('/');
    cy.get('.playlist-item-row').should('contain', 'jefftape');
  });
});
