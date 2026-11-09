/// <reference types="cypress" />

describe('List sesssions', () => {

  const session = {
    id: 1,
    name: 'name session',
    description: 'nouvelle session',
    date: '2026-11-12T00:00:00.000+00:00', // 12/11/2026
    teacher_id: 2,
    users: [1],
    createdAt: '2026-11-09T00:00:00.000+00:00',
    updatedAt: '2026-11-09T00:00:00.000+00:00',
  };

  it('List session ', () => {

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


    cy.visit('/login');
    cy.get('input[formControlName=email]').type('yoga@studio.com');

    //cy.wait('@login');
    cy.visit('/sessions');

  });
})
