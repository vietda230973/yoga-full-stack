
import { expect } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_BASE_URL, UserService } from './user.service';
import { User } from '../models/user.interface';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  const user = {
    id: 1,
    email: 'jane@doe.com',
    firstName: 'Jane',
    lastName: 'Doe',
    admin: false,
  } as unknown as User;

  function setup(baseUrl?: string): void {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ...(baseUrl ? [{ provide: API_BASE_URL, useValue: baseUrl }] : []),
      ],
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  }

  afterEach(() => {
    // Garantit qu'aucune requête inattendue n'est restée en attente
    httpMock.verify();
  });

  describe('avec l\'URL de base par défaut', () => {
    beforeEach(() => setup());

    it('devrait être créé', () => {
      expect(service).toBeTruthy();
    });

    describe('getById()', () => {
      it('devrait envoyer un GET sur /api/users/:id et retourner l\'utilisateur', () => {
        let result: User | undefined;

        service.getById('1').subscribe((r) => (result = r));

        const req = httpMock.expectOne('/api/users/1');
        expect(req.request.method).toBe('GET');
        req.flush(user);

        expect(result).toEqual(user);
      });

      it('devrait encoder l\'identifiant dans l\'URL', () => {
        service.getById('a/b c?d').subscribe();

        const req = httpMock.expectOne('/api/users/a%2Fb%20c%3Fd');
        expect(req.request.method).toBe('GET');
        req.flush(user);
      });

      it('devrait propager une erreur 404', () => {
        let status: number | undefined;

        service.getById('999').subscribe({ error: (e) => (status = e.status) });
        httpMock.expectOne('/api/users/999').flush('Not found', { status: 404, statusText: 'Not Found' });

        expect(status).toBe(404);
      });
    });

    describe('delete()', () => {
      it('devrait envoyer un DELETE sur /api/users/:id', () => {
        let completed = false;

        service.delete('1').subscribe({ complete: () => (completed = true) });

        const req = httpMock.expectOne('/api/users/1');
        expect(req.request.method).toBe('DELETE');
        req.flush({});

        expect(completed).toBe(true);
      });

      it('devrait encoder l\'identifiant dans l\'URL', () => {
        service.delete('a/b c?d').subscribe();

        const req = httpMock.expectOne('/api/users/a%2Fb%20c%3Fd');
        expect(req.request.method).toBe('DELETE');
        req.flush({});
      });

      it('devrait propager une erreur 403', () => {
        let status: number | undefined;

        service.delete('1').subscribe({ error: (e) => (status = e.status) });
        httpMock.expectOne('/api/users/1').flush('Forbidden', { status: 403, statusText: 'Forbidden' });

        expect(status).toBe(403);
      });
    });
  });

  describe('avec une URL de base personnalisée (API_BASE_URL)', () => {
    beforeEach(() => setup('https://example.com/backend'));

    it('devrait utiliser l\'URL fournie pour getById()', () => {
      service.getById('1').subscribe();

      const req = httpMock.expectOne('https://example.com/backend/users/1');
      expect(req.request.method).toBe('GET');
      req.flush(user);
    });

    it('devrait utiliser l\'URL fournie pour delete()', () => {
      service.delete('1').subscribe();

      const req = httpMock.expectOne('https://example.com/backend/users/1');
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });

  describe('API_BASE_URL', () => {
    it('devrait valoir /api par défaut', () => {
      TestBed.configureTestingModule({});

      expect(TestBed.inject(API_BASE_URL)).toBe('/api');

      // httpMock n'est pas utilisé ici : on évite que le verify() de afterEach échoue
      httpMock = { verify: jest.fn() } as unknown as HttpTestingController;
    });
  });
});