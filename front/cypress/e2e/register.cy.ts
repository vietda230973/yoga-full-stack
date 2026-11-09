/// <reference types="cypress" />

describe('Inscription - page /register', () => {
  const user = {
    firstName: 'Toto',
    lastName: 'TEST',
    email: 'toto@test.com',
    password: 'test!1234',
  };

  const fillForm = () => {
    cy.get('input[formControlName=firstName]').type(user.firstName);
    cy.get('input[formControlName=lastName]').type(user.lastName);
    cy.get('input[formControlName=email]').type(user.email);
    cy.get('input[formControlName=password]').type(user.password);
  };

  beforeEach(() => {
    cy.visit('/register');
  });

  it('affiche le formulaire d\'inscription', () => {
    cy.get('input[formControlName=firstName]').should('be.visible');
    cy.get('input[formControlName=lastName]').should('be.visible');
    cy.get('input[formControlName=email]').should('be.visible');
    cy.get('input[formControlName=password]').should('be.visible');
    cy.get('button[type=submit]').should('be.disabled');
  });

  it('inscrit l\'utilisateur et redirige vers /login', () => {
    cy.intercept('POST', '/api/auth/register', {
      statusCode: 200,
      body: { message: 'User registered successfully!' },
    }).as('register');

    fillForm();
    cy.get('button[type=submit]').should('not.be.disabled').click();

    cy.wait('@register').its('request.body').should('deep.equal', user);
    cy.url().should('include', '/login');
  });

  it('affiche une erreur si l\'email est déjà utilisé', () => {
    cy.intercept('POST', '/api/auth/register', {
      statusCode: 400,
      body: { message: 'Error: Email is already taken!' },
    }).as('register');

    fillForm();
    cy.get('button[type=submit]').click();

    cy.wait('@register');
    cy.contains('An error occurred').should('be.visible');
    cy.url().should('include', '/register');
  });

  it('désactive le bouton Submit si un champ obligatoire est vide', () => {
    cy.get('input[formControlName=firstName]').type(user.firstName);
    cy.get('input[formControlName=lastName]').type(user.lastName);
    cy.get('input[formControlName=password]').type(user.password);
    // email non renseigné

    cy.get('button[type=submit]').should('be.disabled');
  });

  it('désactive le bouton Submit si l\'email est invalide', () => {
    fillForm();
    cy.get('input[formControlName=email]').clear().type('email-invalide');

    cy.get('button[type=submit]').should('be.disabled');
  });

  it('accède à la page d\'inscription depuis la barre de navigation', () => {
    cy.visit('/');
    cy.contains('Register').click();
    cy.url().should('include', '/register');
  });
});
