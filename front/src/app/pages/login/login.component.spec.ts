import { ComponentFixture, TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';
import { SessionService } from 'src/app/core/service/session.service';

import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthService } from '../../core/service/auth.service';
import { SessionInformation } from '../../core/models/sessionInformation.interface';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  let authServiceMock: { login: jest.Mock };
  let sessionServiceMock: { logIn: jest.Mock };
  let routerMock: { navigate: jest.Mock };

  const validCredentials = { email: 'user@test.com', password: 'secret' };
  const sessionInfo = { token: 'jwt-token', id: 1 } as unknown as SessionInformation;

  beforeEach(async () => {
    authServiceMock = { login: jest.fn() };
    sessionServiceMock = { logIn: jest.fn() };
    routerMock = { navigate: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideNoopAnimations(),
        { provide: AuthService, useValue: authServiceMock },
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('initialisation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have default state values', () => {
      expect(component.hide).toBe(true);
      expect(component.onError).toBe(false);
      expect(component.isLoading).toBe(false);
    });

    it('should have an invalid form initially', () => {
      expect(component.form.value).toEqual({ email: '', password: '' });
      expect(component.form.invalid).toBe(true);
    });
  });

  describe('form validation', () => {
    it('should require the email', () => {
      const email = component.form.controls.email;
      email.setValue('');
      expect(email.hasError('required')).toBe(true);
    });

    it('should reject an invalid email format', () => {
      const email = component.form.controls.email;
      email.setValue('not-an-email');
      expect(email.hasError('email')).toBe(true);
    });

    it('should accept a valid email', () => {
      const email = component.form.controls.email;
      email.setValue('user@test.com');
      expect(email.valid).toBe(true);
    });

    it('should require the password', () => {
      const password = component.form.controls.password;
      password.setValue('');
      expect(password.hasError('required')).toBe(true);
    });

    it('should require a password of at least 3 characters', () => {
      const password = component.form.controls.password;

      password.setValue('ab');
      expect(password.hasError('minlength')).toBe(true);

      password.setValue('abc');
      expect(password.valid).toBe(true);
    });

    it('should be valid with correct credentials', () => {
      component.form.setValue(validCredentials);
      expect(component.form.valid).toBe(true);
    });
  });

  describe('submit()', () => {
    it('should not call the API when the form is invalid', () => {
      component.form.setValue({ email: 'invalid', password: '' });

      component.submit();

      expect(authServiceMock.login).not.toHaveBeenCalled();
      expect(component.isLoading).toBe(false);
    });

    it('should not call the API when a request is already in progress', () => {
      component.form.setValue(validCredentials);
      component.isLoading = true;

      component.submit();

      expect(authServiceMock.login).not.toHaveBeenCalled();
    });

    it('should call authService.login with the form values', () => {
      authServiceMock.login.mockReturnValue(of(sessionInfo));
      component.form.setValue(validCredentials);

      component.submit();

      expect(authServiceMock.login).toHaveBeenCalledTimes(1);
      expect(authServiceMock.login).toHaveBeenCalledWith(validCredentials);
    });

    it('should set isLoading to true while the request is pending', () => {
      const response$ = new Subject<SessionInformation>();
      authServiceMock.login.mockReturnValue(response$);
      component.form.setValue(validCredentials);

      component.submit();

      expect(component.isLoading).toBe(true);
      expect(component.onError).toBe(false);
    });

    it('should log in and navigate to /sessions on success', () => {
      authServiceMock.login.mockReturnValue(of(sessionInfo));
      component.form.setValue(validCredentials);

      component.submit();

      expect(sessionServiceMock.logIn).toHaveBeenCalledWith(sessionInfo);
      expect(routerMock.navigate).toHaveBeenCalledWith(['/sessions']);
      expect(component.onError).toBe(false);
    });

    it('should set onError and reset isLoading on failure', () => {
      authServiceMock.login.mockReturnValue(
        throwError(() => new Error('Unauthorized'))
      );
      component.form.setValue(validCredentials);

      component.submit();

      expect(component.onError).toBe(true);
      expect(component.isLoading).toBe(false);
      expect(sessionServiceMock.logIn).not.toHaveBeenCalled();
      expect(routerMock.navigate).not.toHaveBeenCalled();
    });

    it('should reset onError before a new attempt', () => {
      const response$ = new Subject<SessionInformation>();
      authServiceMock.login.mockReturnValue(response$);
      component.form.setValue(validCredentials);
      component.onError = true;

      component.submit();

      expect(component.onError).toBe(false);
    });

    it('should allow a new attempt after a failure', () => {
      authServiceMock.login
        .mockReturnValueOnce(throwError(() => new Error('Unauthorized')))
        .mockReturnValueOnce(of(sessionInfo));
      component.form.setValue(validCredentials);

      component.submit();
      expect(component.onError).toBe(true);

      component.submit();

      expect(authServiceMock.login).toHaveBeenCalledTimes(2);
      expect(component.onError).toBe(false);
      expect(routerMock.navigate).toHaveBeenCalledWith(['/sessions']);
    });
  });
});
