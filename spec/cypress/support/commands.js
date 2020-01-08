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
  cy.request('POST', '/auth/sign-in-token', { email }).then((response) => {
    const token = response.body.token;
    cy.request(`/auth/sign-in?t=${token}`);
  });
  cy.visit('/');
});
