Cypress.Commands.add('login', (email, password) => {
  cy.request('POST', 'http://localhost:3001/api/auth/login', { email, password }).then((res) => {
    localStorage.setItem('token', res.body.token);
  });
});

Cypress.Commands.add('loginUI', (email, password) => {
  cy.visit('/login');
  cy.get('[data-cy="email-input"]').type(email);
  cy.get('[data-cy="password-input"]').type(password);
  cy.get('[data-cy="submit-btn"]').click();
  cy.url().should('include', '/dashboard');
});