import { expect } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { TeacherService } from './teacher.service';
import { Teacher } from '../models/teacher.interface';

describe('TeacherService', () => {
  let service: TeacherService;
  let httpMock: HttpTestingController;

  const teacher = {
    id: 1,
    firstName: 'Jane',
    lastName: 'Doe',
  } as unknown as Teacher;

  const teachers = [
    teacher,
    { ...teacher, id: 2, firstName: 'John' },
  ] as unknown as Teacher[];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(TeacherService);
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
    it('devrait envoyer un GET sur api/teacher et retourner la liste', () => {
      let result: Teacher[] | undefined;

      service.all().subscribe((r) => (result = r));

      const req = httpMock.expectOne('api/teacher');
      expect(req.request.method).toBe('GET');
      req.flush(teachers);

      expect(result).toEqual(teachers);
    });

    it('devrait retourner une liste vide', () => {
      let result: Teacher[] | undefined;

      service.all().subscribe((r) => (result = r));
      httpMock.expectOne('api/teacher').flush([]);

      expect(result).toEqual([]);
    });

    it('devrait propager l\'erreur HTTP', () => {
      let status: number | undefined;

      service.all().subscribe({ error: (e) => (status = e.status) });
      httpMock.expectOne('api/teacher').flush('Server error', { status: 500, statusText: 'Server Error' });

      expect(status).toBe(500);
    });
  });

  describe('detail()', () => {
    it('devrait envoyer un GET sur api/teacher/:id et retourner le professeur', () => {
      let result: Teacher | undefined;

      service.detail('1').subscribe((r) => (result = r));

      const req = httpMock.expectOne('api/teacher/1');
      expect(req.request.method).toBe('GET');
      req.flush(teacher);

      expect(result).toEqual(teacher);
    });

    it('devrait propager une erreur 404', () => {
      let status: number | undefined;

      service.detail('999').subscribe({ error: (e) => (status = e.status) });
      httpMock.expectOne('api/teacher/999').flush('Not found', { status: 404, statusText: 'Not Found' });

      expect(status).toBe(404);
    });
  });
});