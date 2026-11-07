import { expect } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { firstValueFrom, of, Subject } from 'rxjs';
import { ListComponent } from './list.component';
import { SessionService } from '../../../../core/service/session.service';
import { SessionApiService } from '../../../../core/service/session-api.service';
import { Session } from '../../../../core/models/session.interface';
import { SessionInformation } from '../../../../core/models/sessionInformation.interface';

describe('ListComponent', () => {
  let fixture: ComponentFixture<ListComponent>;
  let component: ListComponent;

  const sessions = [
    { id: '1', name: 'Yoga', description: 'Morning yoga' },
    { id: '2', name: 'Pilates', description: 'Core strength' },
  ] as unknown as Session[];

  const sessionApiMock = { all: jest.fn() };
  const sessionServiceMock: { sessionInformation: SessionInformation | undefined } = {
    sessionInformation: undefined,
  };

  function setup(): void {
    fixture = TestBed.createComponent(ListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    jest.clearAllMocks();
    sessionApiMock.all.mockReturnValue(of(sessions));
    sessionServiceMock.sessionInformation = { admin: true } as SessionInformation;

    await TestBed.configureTestingModule({
      imports: [ListComponent],
      providers: [
        { provide: SessionApiService, useValue: sessionApiMock },
        { provide: SessionService, useValue: sessionServiceMock },
      ],
    })
      // On teste la logique uniquement : template vide, sans Material ni Router
      .overrideComponent(ListComponent, {
        set: { imports: [], template: '' },
      })
      .compileComponents();
  });

  it('devrait être créé', () => {
    setup();

    expect(component).toBeTruthy();
  });

  describe('sessions$', () => {
    it('devrait appeler sessionApiService.all() une seule fois à la création', () => {
      setup();

      expect(sessionApiMock.all).toHaveBeenCalledTimes(1);
    });

    it('devrait exposer la liste des sessions retournée par l\'API', async () => {
      setup();

      await expect(firstValueFrom(component.sessions$)).resolves.toEqual(sessions);
    });

    it('devrait émettre une liste vide quand il n\'y a aucune session', async () => {
      sessionApiMock.all.mockReturnValue(of([]));
      setup();

      await expect(firstValueFrom(component.sessions$)).resolves.toEqual([]);
    });

    it('devrait relayer les émissions successives de l\'API', () => {
      const api$ = new Subject<Session[]>();
      sessionApiMock.all.mockReturnValue(api$);
      setup();

      const received: Session[][] = [];
      const subscription = component.sessions$.subscribe((s) => received.push(s));

      api$.next([sessions[0]]);
      api$.next(sessions);
      subscription.unsubscribe();

      expect(received).toEqual([[sessions[0]], sessions]);
    });
  });

  describe('user', () => {
    it('devrait retourner les informations de session pour un admin', () => {
      setup();

      expect(component.user).toEqual({ admin: true });
    });

    it('devrait retourner les informations de session pour un non-admin', () => {
      sessionServiceMock.sessionInformation = { admin: false } as SessionInformation;
      setup();

      expect(component.user?.admin).toBe(false);
    });

    it('devrait retourner undefined si personne n\'est connecté', () => {
      sessionServiceMock.sessionInformation = undefined;
      setup();

      expect(component.user).toBeUndefined();
    });

    it('devrait refléter les changements du SessionService (getter, pas une copie)', () => {
      setup();
      expect(component.user?.admin).toBe(true);

      sessionServiceMock.sessionInformation = { admin: false } as SessionInformation;

      expect(component.user?.admin).toBe(false);
    });
  });
});