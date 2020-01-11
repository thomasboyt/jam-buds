describe('creating mixtapes', () => {
  it('directs you to a new mixtape', () => {
    cy.login('jeff@jambuds.club');
    cy.visit('/users/jeff/mixtapes');

    cy.get('button')
      .contains('+ new mixtape')
      .click();

    cy.url().should('match', /\/mixtapes\/(.*)\/new-mixtape$/);
  });
});

describe('editing mixtapes', () => {
  beforeEach(() => {
    cy.login('jeff@jambuds.club');
    cy.visit('/users/jeff/mixtapes');

    cy.get('button')
      .contains('+ new mixtape')
      .click();

    cy.url()
      .should('match', /\/mixtapes\/(.*)\/new-mixtape$/)
      .then((url) => {
        const id = url.match(/\/mixtapes\/(.*)\/new-mixtape$/)[1];
        return id;
      })
      .as('mixtapeId');
  });

  it('updates the mixtape title', function() {
    cy.get('button.enter-button').click();

    cy.get('.title-input')
      .clear()
      .type('Updated Title');

    cy.get('button.save-button').click();

    cy.url().should('include', `/mixtapes/${this.mixtapeId}/updated-title`);
    cy.contains('Updated Title');
  });
});
