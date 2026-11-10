/// <reference types="cypress" />

describe('List sesssions', () => {
  const sessions = [
    {
      id: 1,
      name: 'name session',
      description: 'nouvelle session',
      date: '2026-11-12T00:00:00.000+00:00',
      teacher_id: 2,
      users: [1],
      createdAt: '2026-11-09T00:00:00.000+00:00',
      updatedAt: '2026-11-09T00:00:00.000+00:00',
    },
    {
      id: 2,
      name: 'yoga du soir',
      description: 'session relaxante',
      date: '2026-11-20T00:00:00.000+00:00',
      teacher_id: 1,
      users: [],
      createdAt: '2026-11-09T00:00:00.000+00:00',
      updatedAt: '2026-11-09T00:00:00.000+00:00',
    },
  ];

  const login = (admin: boolean, sessionsResponse: object[] = sessions) => {

    cy.intercept('POST', '/api/auth/login', {
      body: {
        token: 'fake-jwt',
        type: 'Bearer',
        id: 1,
        username: 'yoga@studio.com',
        firstName: 'Admin',
        lastName: 'Admin',
        admin: true,
      },
    }).as('login');

    cy.intercept('GET', '/api/session', sessionsResponse).as('sessions');

    cy.visit('/login');
    cy.login();

    cy.wait('@login');
    cy.wait('@sessions');
    cy.url().should('include', '/sessions');
   };

  describe('en tant qu\'administrateur', () => {
    beforeEach(() => login(true));

    it('affiche toutes les sessions', () => {
      cy.get('mat-card.item').should('have.length', sessions.length);
      cy.contains(sessions[0].name).should('be.visible');
      cy.contains(sessions[0].description).should('be.visible');
      cy.contains(sessions[1].name).should('be.visible');
      cy.contains(sessions[1].description).should('be.visible');
    });
  });
});






