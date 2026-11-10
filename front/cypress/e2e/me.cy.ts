/// <reference types="cypress" />

describe('Compte utilisateur - page /me', () => {
  const baseUser = {
    id: 1,
    email: 'yoga@studio.com',
    firstName: 'Toto',
    lastName: 'Test',
    password: 'encodedPassword',
    createdAt: '2026-01-15T12:00:00.000+00:00',
    updatedAt: '2026-11-09T12:00:00.000+00:00',
  };

  // Connexion par l'interface puis navigation vers /me via la barre de navigation
  // (pas de cy.visit après la connexion, sinon la session en mémoire est perdue)
  const loginAndGoToMe = (admin: boolean) => {
    cy.intercept('POST', '**/api/auth/login', {
      body: {
        token: 'fake-jwt',
        type: 'Bearer',
        id: baseUser.id,
        username: baseUser.email,
        firstName: baseUser.firstName,
        lastName: baseUser.lastName,
        admin,
      },
    }).as('login');
    cy.intercept('GET', '**/api/session', []).as('sessions');
    cy.intercept('GET', `**/api/users/*`, { ...baseUser, admin }).as('user');

    cy.visit('/login');
    cy.login();
    cy.wait('@login');
    cy.url().should('include', '/sessions');

    cy.contains('Account').click();
    cy.url().should('include', '/me');
    cy.wait('@user');
  };

  describe('en tant qu\'utilisateur simple', () => {
    beforeEach(() => loginAndGoToMe(false));

    it('affiche les informations de l\'utilisateur', () => {
      cy.contains('User information').should('be.visible');
      cy.contains(`${baseUser.firstName} ${baseUser.lastName.toUpperCase()}`).should('be.visible');
      cy.contains(baseUser.email).should('be.visible');
      cy.contains('January 15, 2026').should('be.visible'); // date de création
      cy.contains('November 9, 2026').should('be.visible'); // dernière mise à jour
    });

    it('n\'affiche pas la mention administrateur', () => {
      cy.contains('You are admin').should('not.exist');
    });

    it('supprime le compte, déconnecte et redirige vers l\'accueil', () => {
      cy.intercept('DELETE', '**/api/users/*', { statusCode: 200 }).as('deleteUser');

      cy.contains('button', 'delete').click();

      cy.wait('@deleteUser');
      cy.contains('Your account has been deleted !').should('be.visible');
      cy.contains('Login').should('be.visible'); // l'utilisateur est déconnecté
    });

    it('revient à la page précédente avec le bouton retour', () => {
      cy.get('button[mat-icon-button]').first().click();
      cy.url().should('include', '/sessions');
    });
  });


  describe('en tant qu\'administrateur', () => {
    beforeEach(() => loginAndGoToMe(true));

    it('affiche la mention administrateur', () => {
      cy.contains('You are admin').should('be.visible');
    });

    it('n\'affiche pas le bouton de suppression du compte', () => {
      cy.contains('button', 'Delete').should('not.exist');
    });
  });


});
