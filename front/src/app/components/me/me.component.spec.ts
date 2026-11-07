import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { of, Subject } from 'rxjs';

import { MeComponent } from './me.component';
import { User } from '../../core/models/user.interface';
import { SessionService } from '../../core/service/session.service';
import { UserService } from '../../core/service/user.service';

describe('MeComponent', () => {
  let fixture: ComponentFixture<MeComponent>;
  let component: MeComponent;

  const user = {
    id: 42,
    email: 'jane@doe.com',
    firstName: 'Jane',
    lastName: 'Doe',
    admin: false,
  } as unknown as User;

  const sessionServiceMock = {
    sessionInformation: { id: 42 } as any,
    logOut: jest.fn(),
  };
  const userServiceMock = { getById: jest.fn(), delete: jest.fn() };
  const snackBarMock = { open: jest.fn() };
  const routerMock = { navigate: jest.fn() };

  function setup(): void {
    fixture = TestBed.createComponent(MeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // déclenche ngOnInit
  }

  beforeEach(async () => {
    jest.clearAllMocks();
    sessionServiceMock.sessionInformation = { id: 42 };
    userServiceMock.getById.mockReturnValue(of(user));
    userServiceMock.delete.mockReturnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [MeComponent],
      providers: [
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        { provide: Router, useValue: routerMock },
      ],
    })
      // On teste la logique uniquement : template vide, sans Material
      .overrideComponent(MeComponent, {
        set: { imports: [], template: '' },
      })
      .compileComponents();
  });

  it('devrait être créé', () => {
    setup();

    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('devrait charger l\'utilisateur connecté avec son id converti en chaîne', () => {
      setup();

      expect(userServiceMock.getById).toHaveBeenCalledTimes(1);
      expect(userServiceMock.getById).toHaveBeenCalledWith('42');
    });

    it('devrait stocker l\'utilisateur retourné par l\'API', () => {
      setup();

      expect(component.user).toEqual(user);
    });

    it('devrait laisser user undefined tant que l\'API n\'a pas répondu', () => {
      const pending$ = new Subject<User>();
      userServiceMock.getById.mockReturnValue(pending$);

      setup();
      expect(component.user).toBeUndefined();

      pending$.next(user);
      expect(component.user).toEqual(user);
    });

    it('devrait lever une erreur si aucune session n\'est active (non-null assertion)', () => {
      sessionServiceMock.sessionInformation = undefined;
      fixture = TestBed.createComponent(MeComponent);

      expect(() => fixture.detectChanges()).toThrow(TypeError);
      expect(userServiceMock.getById).not.toHaveBeenCalled();
    });
  });

  describe('back()', () => {
    it('devrait revenir à la page précédente', () => {
      const backSpy = jest.spyOn(window.history, 'back').mockImplementation(() => undefined);
      setup();

      component.back();

      expect(backSpy).toHaveBeenCalledTimes(1);
      backSpy.mockRestore();
    });
  });

  describe('delete()', () => {
    it('devrait supprimer le compte avec l\'id converti en chaîne', () => {
      setup();

      component.delete();

      expect(userServiceMock.delete).toHaveBeenCalledTimes(1);
      expect(userServiceMock.delete).toHaveBeenCalledWith('42');
    });

    it('devrait afficher un message, déconnecter et naviguer vers la racine après la suppression', () => {
      setup();

      component.delete();

      expect(snackBarMock.open).toHaveBeenCalledWith('Your account has been deleted !', 'Close', { duration: 3000 });
      expect(sessionServiceMock.logOut).toHaveBeenCalledTimes(1);
      expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
    });

    it('devrait exécuter les actions dans l\'ordre : message, déconnexion, navigation', () => {
      setup();

      component.delete();

      const snackOrder = snackBarMock.open.mock.invocationCallOrder[0];
      const logOutOrder = sessionServiceMock.logOut.mock.invocationCallOrder[0];
      const navigateOrder = routerMock.navigate.mock.invocationCallOrder[0];
      expect(snackOrder).toBeLessThan(logOutOrder);
      expect(logOutOrder).toBeLessThan(navigateOrder);
    });

    it('ne devrait ni déconnecter ni naviguer tant que la suppression n\'est pas terminée', () => {
      const pending$ = new Subject<unknown>();
      userServiceMock.delete.mockReturnValue(pending$);
      setup();

      component.delete();

      expect(snackBarMock.open).not.toHaveBeenCalled();
      expect(sessionServiceMock.logOut).not.toHaveBeenCalled();
      expect(routerMock.navigate).not.toHaveBeenCalled();

      pending$.next({});

      expect(sessionServiceMock.logOut).toHaveBeenCalledTimes(1);
      expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
    });
  });
});