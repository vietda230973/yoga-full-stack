import { expect } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { SessionApiService } from './session-api.service';
import { Session } from '../models/session.interface';

describe('SessionApiService', () => {
  let service: SessionApiService;
  let httpMock: HttpTestingController;

  const session = {
    id: '1',
    name: 'Yoga',
    date: '2026-03-15',
    teacher_id: 3,
    description: 'Morning yoga',
  } as unknown as Session;

  const sessions = [
    session,
    { ...session, id: '2', name: 'Pilates' },
  ] as unknown as Session[];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(SessionApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Garantit qu'aucune requête inattendue n'est restée en attente
    httpMock.verify();
  });

  it('devrait être créé', () => {
    expect(service).toBeTruthy();
  });

  describe('all()', () => {
    it('devrait envoyer un GET sur api/session et retourner la liste', () => {
      let result: Session[] | undefined;

      service.all().subscribe((r) => (result = r));

      const req = httpMock.expectOne('api/session');
      expect(req.request.method).toBe('GET');
      req.flush(sessions);

      expect(result).toEqual(sessions);
    });

    it('devrait retourner une liste vide', () => {
      let result: Session[] | undefined;

      service.all().subscribe((r) => (result = r));
      httpMock.expectOne('api/session').flush([]);

      expect(result).toEqual([]);
    });

    it('devrait propager l\'erreur HTTP', () => {
      let status: number | undefined;

      service.all().subscribe({ error: (e) => (status = e.status) });
      httpMock.expectOne('api/session').flush('Server error', { status: 500, statusText: 'Server Error' });

      expect(status).toBe(500);
    });
  });

  describe('detail()', () => {
    it('devrait envoyer un GET sur api/session/:id et retourner la session', () => {
      let result: Session | undefined;

      service.detail('1').subscribe((r) => (result = r));

      const req = httpMock.expectOne('api/session/1');
      expect(req.request.method).toBe('GET');
      req.flush(session);

      expect(result).toEqual(session);
    });

    it('devrait propager une erreur 404', () => {
      let status: number | undefined;

      service.detail('999').subscribe({ error: (e) => (status = e.status) });
      httpMock.expectOne('api/session/999').flush('Not found', { status: 404, statusText: 'Not Found' });

      expect(status).toBe(404);
    });
  });

  describe('delete()', () => {
    it('devrait envoyer un DELETE sur api/session/:id', () => {
      let completed = false;

      service.delete('1').subscribe({ complete: () => (completed = true) });

      const req = httpMock.expectOne('api/session/1');
      expect(req.request.method).toBe('DELETE');
      req.flush({});

      expect(completed).toBe(true);
    });
  });

  describe('create()', () => {
    it('devrait envoyer un POST sur api/session avec la session en corps', () => {
      let result: Session | undefined;

      service.create(session).subscribe((r) => (result = r));

      const req = httpMock.expectOne('api/session');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(session);
      req.flush(session);

      expect(result).toEqual(session);
    });
  });

  describe('update()', () => {
    it('devrait envoyer un PUT sur api/session/:id avec la session en corps', () => {
      const updated = { ...session, name: 'Yoga avancé' } as unknown as Session;
      let result: Session | undefined;

      service.update('1', updated).subscribe((r) => (result = r));

      const req = httpMock.expectOne('api/session/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updated);
      req.flush(updated);

      expect(result).toEqual(updated);
    });
  });

  describe('participate()', () => {
    it('devrait envoyer un POST sur api/session/:id/participate/:userId sans corps', () => {
      let completed = false;

      service.participate('1', '7').subscribe({ complete: () => (completed = true) });

      const req = httpMock.expectOne('api/session/1/participate/7');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBeNull();
      req.flush(null);

      expect(completed).toBe(true);
    });
  });

  describe('unParticipate()', () => {
    it('devrait envoyer un DELETE sur api/session/:id/participate/:userId', () => {
      let completed = false;

      service.unParticipate('1', '7').subscribe({ complete: () => (completed = true) });

      const req = httpMock.expectOne('api/session/1/participate/7');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);

      expect(completed).toBe(true);
    });
  });
});