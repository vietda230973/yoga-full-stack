import { expect } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';

import { FormComponent } from './form.component';
import { SessionService } from '../../../../core/service/session.service';
import { TeacherService } from '../../../../core/service/teacher.service';
import { SessionApiService } from '../../../../core/service/session-api.service';
import { Session } from '../../../../core/models/session.interface';

jest.mock('../../../../interceptors/utils.service', () => ({
  normalizeToYmdLuxon: jest.fn((d: Date) => d.toISOString()),
}));

describe('FormComponent (code d\'origine)', () => {
  let fixture: ComponentFixture<FormComponent>;
  let component: FormComponent;

  const sessionServiceMock = { sessionInformation: { admin: true } as any };
  const teachers = [{ id: 3, firstName: 'Jane', lastName: 'Doe' }];
  const teacherServiceMock = { all: jest.fn() };
  const sessionApiMock = {
    detail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };
  const snackBarMock = { open: jest.fn() };
  const routerMock = { navigate: jest.fn(), url: '/sessions/create' };
  const routeMock = { snapshot: { paramMap: convertToParamMap({}) } };

  const existingSession = {
    id: '42',
    name: 'Yoga',
    date: '2026-03-15T10:00:00.000Z',
    teacher_id: 3,
    description: 'Morning yoga',
  } as unknown as Session;

  const validValue = {
    name: 'Yoga',
    date: '2026-03-15',
    teacher_id: 3,
    description: 'Morning yoga',
  };

  function setup(opts: { admin?: boolean; url?: string; id?: string | null } = {}): void {
    sessionServiceMock.sessionInformation = { admin: opts.admin !== false };
    routerMock.url = opts.url ?? '/sessions/create';
    routeMock.snapshot.paramMap = convertToParamMap(opts.id ? { id: opts.id } : {});

    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // déclenche ngOnInit
  }

  beforeEach(async () => {
    jest.clearAllMocks();
    teacherServiceMock.all.mockReturnValue(of(teachers));
    sessionApiMock.detail.mockReturnValue(of(existingSession));
    sessionApiMock.create.mockReturnValue(of(existingSession));
    sessionApiMock.update.mockReturnValue(of(existingSession));

    await TestBed.configureTestingModule({
      imports: [FormComponent],
      providers: [
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: TeacherService, useValue: teacherServiceMock },
        { provide: SessionApiService, useValue: sessionApiMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: routeMock },
      ],
    })
      // On teste la logique uniquement : template vide, sans Material
      .overrideComponent(FormComponent, {
        set: { imports: [ReactiveFormsModule], template: '' },
      })
      .compileComponents();
  });

  describe('ngOnInit', () => {
    it('devrait rediriger vers /sessions si l\'utilisateur n\'est pas admin', () => {
      setup({ admin: false });

      expect(routerMock.navigate).toHaveBeenCalledWith(['/sessions']);
      expect(sessionApiMock.detail).not.toHaveBeenCalled();
      expect(component.sessionForm).toBeUndefined();
    });

    it('devrait exposer la liste des professeurs', (done) => {
      setup();

      component.teachers$.subscribe((result) => {
        expect(result).toEqual(teachers);
        done();
      });
    });

    it('devrait rester en mode création si l\'URL ne contient pas "update"', () => {
      setup({ url: '/sessions/create' });

      expect(component.onUpdate).toBe(false);
      expect(sessionApiMock.detail).not.toHaveBeenCalled();
      expect(component.sessionForm).toBeDefined();
      expect(component.sessionForm!.value).toEqual({
        name: '',
        date: '',
        teacher_id: '',
        description: '',
      });
    });

    it('devrait charger la session et initialiser le formulaire en mode modification', () => {
      setup({ url: '/sessions/update/42', id: '42' });

      expect(component.onUpdate).toBe(true);
      expect(sessionApiMock.detail).toHaveBeenCalledWith('42');
      expect(component.sessionForm!.value).toEqual(validValue);
    });

    it('devrait laisser sessionForm undefined tant que detail() n\'a pas répondu', () => {
      const pending$ = new Subject<Session>();
      sessionApiMock.detail.mockReturnValue(pending$);

      setup({ url: '/sessions/update/42', id: '42' });
      expect(component.sessionForm).toBeUndefined();

      pending$.next(existingSession);
      expect(component.sessionForm).toBeDefined();
      expect(component.sessionForm!.value).toEqual(validValue);
    });

    it('devrait rediriger vers /sessions en mode modification sans paramètre id', () => {
      setup({ url: '/sessions/update', id: null });

      expect(component.onUpdate).toBe(false);
      expect(sessionApiMock.detail).not.toHaveBeenCalled();
      expect(component.sessionForm).toBeUndefined();
    });
  });

  describe('validation du formulaire', () => {
    beforeEach(() => setup());

    it('devrait être invalide quand il est vide', () => {
      expect(component.sessionForm!.invalid).toBe(true);
    });

    it('devrait être valide avec des valeurs correctes', () => {
      component.sessionForm!.setValue(validValue);

      expect(component.sessionForm!.valid).toBe(true);
    });

    it.each(['name', 'date', 'teacher_id', 'description'])(
      'devrait exiger le champ "%s"',
      (field) => {
        component.sessionForm!.setValue(validValue);
        component.sessionForm!.get(field)!.setValue('');

        expect(component.sessionForm!.get(field)!.hasError('required')).toBe(true);
      }
    );

    it('devrait accepter une description de exactement 2000 caractères', () => {
      component.sessionForm!.get('description')!.setValue('a'.repeat(2000));

      expect(component.sessionForm!.get('description')!.errors).toBeNull();
    });

    it('devrait rejeter une description de plus de 2000 caractères', () => {
      component.sessionForm!.get('description')!.setValue('a'.repeat(2001));

      expect(component.sessionForm!.get('description')!.hasError('maxlength')).toBe(true);
    });

    it('ne devrait pas traiter une description numérique comme un nombre', () => {
      component.sessionForm!.get('description')!.setValue('5000');

      expect(component.sessionForm!.get('description')!.errors).toBeNull();
    });
  });

  describe('submit', () => {
    it('ne devrait rien appeler si le formulaire est invalide', () => {
      setup();

      component.submit();

      expect(sessionApiMock.create).not.toHaveBeenCalled();
      expect(sessionApiMock.update).not.toHaveBeenCalled();
      expect(snackBarMock.open).not.toHaveBeenCalled();
      expect(routerMock.navigate).not.toHaveBeenCalled();
    });

    it('ne devrait pas planter si sessionForm est undefined', () => {
      setup({ url: '/sessions/update', id: null }); // sessionForm jamais initialisé
      routerMock.navigate.mockClear();

      expect(() => component.submit()).not.toThrow();
      expect(sessionApiMock.create).not.toHaveBeenCalled();
      expect(sessionApiMock.update).not.toHaveBeenCalled();
    });

    it('devrait créer la session, afficher un message et naviguer en mode création', () => {
      setup();
      component.sessionForm!.setValue(validValue);

      component.submit();

      expect(sessionApiMock.create).toHaveBeenCalledWith(validValue);
      expect(sessionApiMock.update).not.toHaveBeenCalled();
      expect(snackBarMock.open).toHaveBeenCalledWith('Session created !', 'Close', { duration: 3000 });
      expect(routerMock.navigate).toHaveBeenCalledWith(['sessions']);
    });

    it('devrait mettre à jour la session, afficher un message et naviguer en mode modification', () => {
      setup({ url: '/sessions/update/42', id: '42' });
      component.sessionForm!.setValue(validValue);

      component.submit();

      expect(sessionApiMock.update).toHaveBeenCalledWith('42', validValue);
      expect(sessionApiMock.create).not.toHaveBeenCalled();
      expect(snackBarMock.open).toHaveBeenCalledWith('Session updated !', 'Close', { duration: 3000 });
      expect(routerMock.navigate).toHaveBeenCalledWith(['sessions']);
    });
  });
});

