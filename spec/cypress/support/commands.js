// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

Cypress.Commands.add('login', (email) => {
  cy.request('POST', '/api/sign-in-token', { email }).then((response) => {
    const token = response.body.token;
    cy.visit(`/sign-in?t=${token}`);
  });
});
