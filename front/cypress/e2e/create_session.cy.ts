/// <reference types="cypress" />

describe('Création d\'une session', () => {
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

  const teachers = [
    { id: 1, firstName: 'Margot', lastName: 'DELAHAYE', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
    { id: 2, firstName: 'Hélène', lastName: 'THIERCELIN', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  ];

  beforeEach(() => {
    // Connexion en tant qu'admin (seul un admin peut créer une session)
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
    cy.intercept('GET', '/api/session', []).as('sessions');

    cy.visit('/login');
    cy.get('input[formControlName=email]').type('yoga@studio.com');
    cy.get('input[formControlName=password]').type('test!1234{enter}{enter}');

    cy.wait('@login');
    cy.url().should('include', '/sessions');
  });

  it('crée une session et l\'affiche dans la liste', () => {
    cy.intercept('GET', '/api/teacher', teachers).as('teachers');
    cy.intercept('POST', '/api/session', { statusCode: 200, body: session }).as('createSession');

    // Accès au formulaire de création
    cy.contains('button', 'Create').click();
    cy.url().should('include', '/sessions/create');
    cy.wait('@teachers');


    // Remplissage du formulaire
    cy.get('input[formControlName=name]').type(session.name);
    cy.get('input[formControlName=date]').type('2026-11-12'); // input type="date" => format yyyy-MM-dd
    cy.get('mat-select[formControlName=teacher_id]').click();
    cy.contains('mat-option', 'Hélène').click();
    cy.get('textarea[formControlName=description]').type(session.description);

    // Après la création, la liste est rechargée avec la nouvelle session
    cy.intercept('GET', '/api/session', [session]).as('sessionsAfterCreate');

    cy.get('button[type=submit]').should('not.be.disabled').click();

    // Vérification de la requête envoyée à l'API
    cy.wait('@createSession').its('request.body').should((body) => {
      expect(body.name).to.eq(session.name);
      expect(body.description).to.eq(session.description);
      expect(body.teacher_id).to.eq(session.teacher_id);
      expect(body.date).to.contain('2026-11-12');
    });

    // Vérification du résultat
    cy.contains('Session created !').should('be.visible');
    cy.url().should('include', '/sessions');
    cy.wait('@sessionsAfterCreate');
    cy.contains(session.name).should('be.visible');
  });

  it('désactive le bouton Save si un champ obligatoire est vide', () => {
    cy.intercept('GET', '/api/teacher', teachers).as('teachers');

    cy.contains('button', 'Create').click();
    cy.url().should('include', '/sessions/create');
    cy.wait('@teachers');

    cy.get('input[formControlName=date]').type('2026-11-12');
    cy.get('mat-select[formControlName=teacher_id]').click();
    cy.contains('mat-option', 'Hélène').click();
    cy.get('textarea[formControlName=description]').type(session.description);
    // le nom n'est pas renseigné

    cy.get('button[type=submit]').should('be.disabled');
  });
});
