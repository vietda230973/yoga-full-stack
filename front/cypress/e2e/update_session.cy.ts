/// <reference types="cypress" />

describe('Modification d\'une session', () => {
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

  const updatedSession = {
    ...session,
    name: 'session modifiée',
    description: 'description modifiée',
  };

  const teachers = [
    { id: 1, firstName: 'Margot', lastName: 'DELAHAYE', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
    { id: 2, firstName: 'Hélène', lastName: 'THIERCELIN', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  ];

  beforeEach(() => {
    // Connexion en tant qu'admin (seul un admin peut modifier une session)
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
    cy.intercept('GET', '/api/session', [session]).as('sessions');
    cy.intercept('GET', '/api/session/1', session).as('session');
    cy.intercept('GET', '/api/teacher', teachers).as('teachers');

    cy.visit('/login');
    cy.get('input[formControlName=email]').type('yoga@studio.com');
    cy.get('input[formControlName=password]').type('test!1234{enter}{enter}');

    cy.wait('@login');
    cy.url().should('include', '/sessions');
    cy.wait('@sessions');

    // Navigation par l'interface (pas de cy.visit, sinon la connexion est perdue)
    cy.contains('button', 'Edit').click();
    cy.url().should('include', '/sessions/update/1');
    cy.wait(['@session', '@teachers']);
  });

  it('pré-remplit le formulaire avec les données de la session', () => {
    cy.get('input[formControlName=name]').should('have.value', session.name);
    cy.get('input[formControlName=date]').should('have.value', '2026-11-12');
    cy.get('mat-select[formControlName=teacher_id]').should('contain', 'Hélène');
    cy.get('textarea[formControlName=description]').should('have.value', session.description);
  });

  it('modifie la session et affiche la liste mise à jour', () => {
    cy.intercept('PUT', '/api/session/1', { statusCode: 200, body: updatedSession }).as('updateSession');

    cy.get('input[formControlName=name]').clear().type(updatedSession.name);
    cy.get('textarea[formControlName=description]').clear().type(updatedSession.description);

    // Après la modification, la liste est rechargée avec la session modifiée
    cy.intercept('GET', '/api/session', [updatedSession]).as('sessionsAfterUpdate');

    cy.get('button[type=submit]').should('not.be.disabled').click();

    // Vérification de la requête envoyée à l'API
    cy.wait('@updateSession').its('request.body').should((body) => {
      expect(body.name).to.eq(updatedSession.name);
      expect(body.description).to.eq(updatedSession.description);
      expect(body.teacher_id).to.eq(session.teacher_id);
      expect(body.date).to.contain('2026-11-12');
    });

    // Vérification du résultat
    cy.contains('Session updated !').should('be.visible');
    cy.url().should('include', '/sessions');
    cy.wait('@sessionsAfterUpdate');
    cy.contains(updatedSession.name).should('be.visible');
  });

  it('désactive le bouton Save si un champ obligatoire est vidé', () => {
    cy.get('input[formControlName=name]').clear();
    cy.get('button[type=submit]').should('be.disabled');
  });
});
