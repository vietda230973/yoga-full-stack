import { expect } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { AppComponent } from './app.component';
import { AuthService } from './core/service/auth.service';
import { SessionService } from './core/service/session.service';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let isLoggedSubject: BehaviorSubject<boolean>;

  const sessionServiceMock = {
    $isLogged: jest.fn(),
    logOut: jest.fn(),
  };
  const routerMock = { navigate: jest.fn() };
  // AuthService est injecté mais pas utilisé : un objet vide suffit (évite de charger HttpClient)
  const authServiceMock = {};

  function setup(): void {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    jest.clearAllMocks();
    isLoggedSubject = new BehaviorSubject<boolean>(false);
    sessionServiceMock.$isLogged.mockReturnValue(isLoggedSubject.asObservable());

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    })
      // On teste la logique uniquement : template vide, sans Material ni Router
      .overrideComponent(AppComponent, {
        set: { imports: [], template: '' },
      })
      .compileComponents();
  });

  it('devrait être créé', () => {
    setup();

    expect(component).toBeTruthy();
  });

  describe('isLogged$', () => {
    it('devrait appeler sessionService.$isLogged() une seule fois à la création', () => {
      setup();

      expect(sessionServiceMock.$isLogged).toHaveBeenCalledTimes(1);
    });

    it('devrait émettre false quand l\'utilisateur est déconnecté', async () => {
      setup();

      await expect(firstValueFrom(component.isLogged$)).resolves.toBe(false);
    });

    it('devrait émettre true quand l\'utilisateur est connecté', async () => {
      isLoggedSubject.next(true);
      setup();

      await expect(firstValueFrom(component.isLogged$)).resolves.toBe(true);
    });

    it('devrait relayer les changements d\'état de connexion', () => {
      setup();
      const emitted: boolean[] = [];
      const subscription = component.isLogged$.subscribe((v) => emitted.push(v));

      isLoggedSubject.next(true);
      isLoggedSubject.next(false);
      subscription.unsubscribe();

      expect(emitted).toEqual([false, true, false]);
    });
  });

  describe('logout()', () => {
    it('devrait appeler sessionService.logOut()', () => {
      setup();

      component.logout();

      expect(sessionServiceMock.logOut).toHaveBeenCalledTimes(1);
    });

    it('devrait naviguer vers la racine', () => {
      setup();

      component.logout();

      expect(routerMock.navigate).toHaveBeenCalledWith(['']);
    });

    it('devrait déconnecter avant de naviguer', () => {
      setup();

      component.logout();

      const logOutOrder = sessionServiceMock.logOut.mock.invocationCallOrder[0];
      const navigateOrder = routerMock.navigate.mock.invocationCallOrder[0];
      expect(logOutOrder).toBeLessThan(navigateOrder);
    });
  });
});