import { ComponentFixture, TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';
import { provideRouter } from '@angular/router';
import { NotFoundComponent } from './not-found.component';

describe('NotFoundComponent', () => {
  let fixture: ComponentFixture<NotFoundComponent>;
  let component: NotFoundComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFoundComponent],
      // Au cas où le template contient un routerLink (ex. lien de retour à l'accueil)
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(NotFoundComponent);
    component = fixture.componentInstance;
  });

  it('devrait être créé', () => {
    expect(component).toBeTruthy();
  });

  it('devrait se rendre sans erreur avec son vrai template', () => {
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('devrait afficher du contenu', () => {
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent?.trim();
    expect(text).toBeTruthy();
  });
});