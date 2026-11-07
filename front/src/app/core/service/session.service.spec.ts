import { expect } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { SessionService } from './session.service';
import { SessionInformation } from '../models/sessionInformation.interface';

describe('SessionService', () => {
  let service: SessionService;

  const user = {
    token: 'jwt-token',
    type: 'Bearer',
    id: 1,
    username: 'jane@doe.com',
    firstName: 'Jane',
    lastName: 'Doe',
    admin: true,
  } as unknown as SessionInformation;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionService);
  });

  it('devrait être créé', () => {
    expect(service).toBeTruthy();
  });

  describe('état initial', () => {
    it('devrait être déconnecté', () => {
      expect(service.isLogged).toBe(false);
    });

    it('ne devrait pas avoir d\'informations de session', () => {
      expect(service.sessionInformation).toBeUndefined();
    });

    it('$isLogged() devrait émettre false immédiatement (BehaviorSubject)', async () => {
      await expect(firstValueFrom(service.$isLogged())).resolves.toBe(false);
    });
  });

  describe('logIn()', () => {
    it('devrait enregistrer les informations de l\'utilisateur', () => {
      service.logIn(user);

      expect(service.sessionInformation).toEqual(user);
    });

    it('devrait passer isLogged à true', () => {
      service.logIn(user);

      expect(service.isLogged).toBe(true);
    });

    it('devrait faire émettre true à $isLogged()', async () => {
      service.logIn(user);

      await expect(firstValueFrom(service.$isLogged())).resolves.toBe(true);
    });
  });

  describe('logOut()', () => {
    beforeEach(() => service.logIn(user));

    it('devrait effacer les informations de l\'utilisateur', () => {
      service.logOut();

      expect(service.sessionInformation).toBeUndefined();
    });

    it('devrait passer isLogged à false', () => {
      service.logOut();

      expect(service.isLogged).toBe(false);
    });

    it('devrait faire émettre false à $isLogged()', async () => {
      service.logOut();

      await expect(firstValueFrom(service.$isLogged())).resolves.toBe(false);
    });

    it('devrait être sans effet néfaste si personne n\'est connecté', () => {
      service.logOut();

      expect(() => service.logOut()).not.toThrow();
      expect(service.isLogged).toBe(false);
      expect(service.sessionInformation).toBeUndefined();
    });
  });

  describe('$isLogged()', () => {
    it('devrait émettre chaque changement d\'état dans l\'ordre', () => {
      const emitted: boolean[] = [];
      const subscription = service.$isLogged().subscribe((v) => emitted.push(v));

      service.logIn(user);
      service.logOut();
      service.logIn(user);
      subscription.unsubscribe();

      expect(emitted).toEqual([false, true, false, true]);
    });

    it('devrait rejouer la dernière valeur à un abonné tardif', async () => {
      service.logIn(user);

      await expect(firstValueFrom(service.$isLogged())).resolves.toBe(true);
    });

    it('ne devrait pas permettre d\'émettre depuis l\'extérieur (asObservable)', () => {
      const observable = service.$isLogged();

      expect((observable as any).next).toBeUndefined();
    });
  });
});