import { expect } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../core/service/auth.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  let authServiceMock: { register: jest.Mock };
  let routerMock: { navigate: jest.Mock };

  const validData = {
    email: 'user@test.com',
    firstName: 'John',
    lastName: 'Doe',
    password: 'secret',
  };

  beforeEach(async () => {
    authServiceMock = { register: jest.fn() };
    routerMock = { navigate: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideNoopAnimations(),
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('initialisation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have default state values', () => {
      expect(component.onError).toBe(false);
      expect(component.loading).toBe(false);
    });

    it('should have an empty and invalid form initially', () => {
      expect(component.form.value).toEqual({
        email: '',
        firstName: '',
        lastName: '',
        password: '',
      });
      expect(component.form.invalid).toBe(true);
    });
  });

  describe('form validation', () => {
    describe('email', () => {
      it('should be required', () => {
        const control = component.form.controls.email;
        control.setValue('');
        expect(control.hasError('required')).toBe(true);
      });

      it('should reject an invalid format', () => {
        const control = component.form.controls.email;
        control.setValue('not-an-email');
        expect(control.hasError('email')).toBe(true);
      });

      it('should accept a valid email', () => {
        const control = component.form.controls.email;
        control.setValue('user@test.com');
        expect(control.valid).toBe(true);
      });
    });

    describe.each(['firstName', 'lastName'] as const)('%s', (field) => {
      it('should be required', () => {
        const control = component.form.controls[field];
        control.setValue('');
        expect(control.hasError('required')).toBe(true);
      });

      it('should require at least 3 characters', () => {
        const control = component.form.controls[field];

        control.setValue('ab');
        expect(control.hasError('minlength')).toBe(true);

        control.setValue('abc');
        expect(control.valid).toBe(true);
      });

      it('should accept at most 20 characters', () => {
        const control = component.form.controls[field];

        control.setValue('a'.repeat(20));
        expect(control.valid).toBe(true);

        control.setValue('a'.repeat(21));
        expect(control.hasError('maxlength')).toBe(true);
      });
    });

    describe('password', () => {
      it('should be required', () => {
        const control = component.form.controls.password;
        control.setValue('');
        expect(control.hasError('required')).toBe(true);
      });

      it('should require at least 3 characters', () => {
        const control = component.form.controls.password;

        control.setValue('ab');
        expect(control.hasError('minlength')).toBe(true);

        control.setValue('abc');
        expect(control.valid).toBe(true);
      });
      
      it('should accept at most 40 characters', () => {
        const control = component.form.controls.password;

        control.setValue('a'.repeat(40));
        expect(control.valid).toBe(true);

        control.setValue('a'.repeat(41));
        expect(control.hasError('maxlength')).toBe(true);
      });
    });

    it('should be valid with correct data', () => {
      component.form.setValue(validData);
      expect(component.form.valid).toBe(true);
    });
  });

  describe('submit()', () => {
    it('should not call the API when the form is invalid', () => {
      component.form.setValue({ ...validData, email: 'invalid' });

      component.submit();

      expect(authServiceMock.register).not.toHaveBeenCalled();
      expect(component.loading).toBe(false);
    });

    it('should not call the API when a request is already in progress', () => {
      component.form.setValue(validData);
      component.loading = true;

      component.submit();

      expect(authServiceMock.register).not.toHaveBeenCalled();
    });

    it('should call authService.register with the form values', () => {
      authServiceMock.register.mockReturnValue(of(undefined));
      component.form.setValue(validData);

      component.submit();

      expect(authServiceMock.register).toHaveBeenCalledTimes(1);
      expect(authServiceMock.register).toHaveBeenCalledWith(validData);
    });

    it('should set loading to true while the request is pending', () => {
      authServiceMock.register.mockReturnValue(new Subject<void>());
      component.form.setValue(validData);

      component.submit();

      expect(component.loading).toBe(true);
      expect(component.onError).toBe(false);
    });

    it('should navigate to /login on success', () => {
      authServiceMock.register.mockReturnValue(of(undefined));
      component.form.setValue(validData);

      component.submit();

      expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
      expect(component.onError).toBe(false);
    });

    it('should set onError and reset loading on failure', () => {
      authServiceMock.register.mockReturnValue(
        throwError(() => new Error('Bad request'))
      );
      component.form.setValue(validData);

      component.submit();

      expect(component.onError).toBe(true);
      expect(component.loading).toBe(false);
      expect(routerMock.navigate).not.toHaveBeenCalled();
    });

    it('should reset onError before a new attempt', () => {
      authServiceMock.register.mockReturnValue(new Subject<void>());
      component.form.setValue(validData);
      component.onError = true;

      component.submit();

      expect(component.onError).toBe(false);
    });

    it('should allow a new attempt after a failure', () => {
      authServiceMock.register
        .mockReturnValueOnce(throwError(() => new Error('Bad request')))
        .mockReturnValueOnce(of(undefined));
      component.form.setValue(validData);

      component.submit();
      expect(component.onError).toBe(true);

      component.submit();

      expect(authServiceMock.register).toHaveBeenCalledTimes(2);
      expect(component.onError).toBe(false);
      expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
    });
  });
});