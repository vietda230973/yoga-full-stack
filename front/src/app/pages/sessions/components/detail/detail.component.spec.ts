import { expect } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { DetailComponent } from './detail.component';
import { Session } from '../../../../core/models/session.interface';
import { Teacher } from '../../../../core/models/teacher.interface';
import { SessionApiService } from '../../../../core/service/session-api.service';
import { SessionService } from '../../../../core/service/session.service';
import { TeacherService } from '../../../../core/service/teacher.service';

describe('DetailComponent', () => {
  let component: DetailComponent;
  let fixture: ComponentFixture<DetailComponent>;
  let snackBarOpen: jest.SpyInstance;

  let routeMock: { snapshot: { paramMap: { get: jest.Mock } } };
  let sessionServiceMock: { sessionInformation: { admin: boolean; id: number } };
  let sessionApiMock: {
    detail: jest.Mock;
    delete: jest.Mock;
    participate: jest.Mock;
    unParticipate: jest.Mock;
  };
  let teacherServiceMock: { detail: jest.Mock };
  let routerMock: { navigate: jest.Mock };

  const USER_ID = 10;

  const sessionNotJoined = {
    id: 1,
    name: 'Yoga du matin',
    description: 'Séance de yoga',
    teacher_id: 5,
    users: [20, 30],
  } as unknown as Session;

  const sessionJoined = {
    ...sessionNotJoined,
    users: [20, 30, USER_ID],
  } as unknown as Session;

  const teacher = { id: 5, firstName: 'Jane', lastName: 'Doe' } as unknown as Teacher;

  /**
   * Crée le composant. Le constructeur lit la route et la session :
   * les mocks doivent donc être configurés avant l'appel.
   * ngOnInit n'est PAS lancé ici : chaque test appelle fixture.detectChanges().
   */
  function createComponent(info = { admin: false, id: USER_ID }): void {
    sessionServiceMock.sessionInformation = info;

    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;

    // MaterialModule fournit son propre MatSnackBar à l'injecteur du composant :
    // on récupère donc l'instance réellement utilisée par le composant.
    const snackBar = fixture.debugElement.injector.get(MatSnackBar);
    snackBarOpen = jest.spyOn(snackBar, 'open').mockImplementation(() => ({}) as never);
  }

  beforeEach(async () => {
    routeMock = { snapshot: { paramMap: { get: jest.fn().mockReturnValue('1') } } };
    sessionServiceMock = { sessionInformation: { admin: false, id: USER_ID } };
    sessionApiMock = {
      detail: jest.fn().mockReturnValue(of(sessionNotJoined)),
      delete: jest.fn().mockReturnValue(of(undefined)),
      participate: jest.fn().mockReturnValue(of(undefined)),
      unParticipate: jest.fn().mockReturnValue(of(undefined)),
    };
    teacherServiceMock = { detail: jest.fn().mockReturnValue(of(teacher)) };
    routerMock = { navigate: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [DetailComponent],
      providers: [
        provideNoopAnimations(),
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: SessionApiService, useValue: sessionApiMock },
        { provide: TeacherService, useValue: teacherServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    })
      // On teste la logique de la classe, pas le template (voir spec de template à part)
      .overrideComponent(DetailComponent, { set: { template: '' } })
      .compileComponents();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create', () => {
      createComponent();
      expect(component).toBeTruthy();
    });

    it('should read the session id from the route', () => {
      createComponent();
      expect(routeMock.snapshot.paramMap.get).toHaveBeenCalledWith('id');
      expect(component.sessionId).toBe('1');
    });

    it('should read userId and isAdmin from the session information', () => {
      createComponent({ admin: true, id: 42 });
      expect(component.userId).toBe(42);
      expect(component.isAdmin).toBe(true);
    });

    it('should not be admin for a regular user', () => {
      createComponent({ admin: false, id: USER_ID });
      expect(component.isAdmin).toBe(false);
    });

    it('should have default state values', () => {
      createComponent();
      expect(component.loading).toBe(false);
      expect(component.isParticipate).toBe(false);
      expect(component.session).toBeUndefined();
      expect(component.teacher).toBeUndefined();
    });
  });

  describe('ngOnInit()', () => {
    it('should load the session and its teacher', () => {
      createComponent();

      fixture.detectChanges();

      expect(sessionApiMock.detail).toHaveBeenCalledWith('1');
      expect(teacherServiceMock.detail).toHaveBeenCalledWith('5');
      expect(component.session).toEqual(sessionNotJoined);
      expect(component.teacher).toEqual(teacher);
    });

    it('should set isParticipate to true when the user is in the session', () => {
      sessionApiMock.detail.mockReturnValue(of(sessionJoined));
      createComponent();

      fixture.detectChanges();

      expect(component.isParticipate).toBe(true);
    });

    it('should set isParticipate to false when the user is not in the session', () => {
      createComponent();

      fixture.detectChanges();

      expect(component.isParticipate).toBe(false);
    });

    it('should show a snackbar when the session cannot be loaded', () => {
      sessionApiMock.detail.mockReturnValue(throwError(() => new Error('404')));
      createComponent();

      fixture.detectChanges();

      expect(snackBarOpen).toHaveBeenCalledWith('Unable to load the session', 'Close', {
        duration: 3000,
      });
      expect(teacherServiceMock.detail).not.toHaveBeenCalled();
    });

    it('should show a snackbar when the teacher cannot be loaded', () => {
      teacherServiceMock.detail.mockReturnValue(throwError(() => new Error('500')));
      createComponent();

      fixture.detectChanges();

      expect(snackBarOpen).toHaveBeenCalledWith('Unable to load the session', 'Close', {
        duration: 3000,
      });
      expect(component.teacher).toBeUndefined();
    });
  });

  describe('back()', () => {
    it('should go back in the browser history', () => {
      const historyBack = jest.spyOn(window.history, 'back').mockImplementation(() => undefined);
      createComponent();

      component.back();

      expect(historyBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete()', () => {
    it('should call the API with the session id', () => {
      createComponent();

      component.delete();

      expect(sessionApiMock.delete).toHaveBeenCalledWith('1');
    });

    it('should show a snackbar and navigate to the sessions list on success', () => {
      createComponent();

      component.delete();

      expect(snackBarOpen).toHaveBeenCalledWith('Session deleted !', 'Close', { duration: 3000 });
      expect(routerMock.navigate).toHaveBeenCalledWith(['sessions']);
    });

    it('should not navigate before the API answers', () => {
      sessionApiMock.delete.mockReturnValue(new Subject<void>());
      createComponent();

      component.delete();

      expect(routerMock.navigate).not.toHaveBeenCalled();
      expect(snackBarOpen).not.toHaveBeenCalled();
    });
  });

  describe.each([
    ['participate', 'participate'],
    ['unParticipate', 'unParticipate'],
  ] as const)('%s()', (method, apiMethod) => {
    beforeEach(() => {
      createComponent();
      fixture.detectChanges(); // ngOnInit : 1er appel à detail()
      sessionApiMock.detail.mockClear();
      teacherServiceMock.detail.mockClear();
    });

    it('should call the API with the session id and the user id as string', () => {
      component[method]();

      expect(sessionApiMock[apiMethod]).toHaveBeenCalledWith('1', String(USER_ID));
    });

    it('should reload the session and the teacher after success', () => {
      component[method]();

      expect(sessionApiMock.detail).toHaveBeenCalledTimes(1);
      expect(sessionApiMock.detail).toHaveBeenCalledWith('1');
      expect(teacherServiceMock.detail).toHaveBeenCalledWith('5');
    });

    it('should set loading to true while the request is pending', () => {
      sessionApiMock[apiMethod].mockReturnValue(new Subject<void>());

      component[method]();

      expect(component.loading).toBe(true);
    });

    it('should reset loading to false once finished', () => {
      component[method]();

      expect(component.loading).toBe(false);
    });

    it('should do nothing when a request is already in progress', () => {
      component.loading = true;

      component[method]();

      expect(sessionApiMock[apiMethod]).not.toHaveBeenCalled();
    });

    it('should show a snackbar and reset loading when the API fails', () => {
      sessionApiMock[apiMethod].mockReturnValue(throwError(() => new Error('500')));

      component[method]();

      expect(snackBarOpen).toHaveBeenCalledWith(expect.any(String), 'Close', { duration: 3000 });
      expect(component.loading).toBe(false);
      expect(sessionApiMock.detail).not.toHaveBeenCalled();
    });

    it('should show a snackbar and reset loading when the reload fails', () => {
      sessionApiMock.detail.mockReturnValue(throwError(() => new Error('500')));

      component[method]();

      expect(snackBarOpen).toHaveBeenCalledWith(expect.any(String), 'Close', { duration: 3000 });
      expect(component.loading).toBe(false);
    });
  });

  describe('participation state after reload', () => {
    it('should become participant after participate()', () => {
      createComponent();
      fixture.detectChanges();
      expect(component.isParticipate).toBe(false);

      sessionApiMock.detail.mockReturnValue(of(sessionJoined));
      component.participate();

      expect(component.isParticipate).toBe(true);
    });

    it('should stop being participant after unParticipate()', () => {
      sessionApiMock.detail.mockReturnValue(of(sessionJoined));
      createComponent();
      fixture.detectChanges();
      expect(component.isParticipate).toBe(true);

      sessionApiMock.detail.mockReturnValue(of(sessionNotJoined));
      component.unParticipate();

      expect(component.isParticipate).toBe(false);
    });
  });
});