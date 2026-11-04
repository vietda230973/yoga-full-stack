import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Teacher } from '../../../../core/models/teacher.interface';
import { SessionService } from '../../../../core/service/session.service';
import { TeacherService } from '../../../../core/service/teacher.service';
import { Session } from '../../../../core/models/session.interface';
import { SessionApiService } from '../../../../core/service/session-api.service';
import { MaterialModule } from "../../../../shared/material.module";
import { CommonModule } from "@angular/common";
import { Observable, switchMap, tap} from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { DestroyRef } from "@angular/core";
import { finalize } from "rxjs/operators";

@Component({
  selector: 'app-detail',
  imports: [CommonModule, MaterialModule],
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {
  public session: Session | undefined;
  public teacher: Teacher | undefined;
  public isParticipate = false;
  public isAdmin = false;
  public sessionId: string;
  public userId: number;
  public loading = false;

  private route = inject(ActivatedRoute);
  private sessionService = inject(SessionService);
  private sessionApiService = inject(SessionApiService);
  private teacherService = inject(TeacherService);
  private matSnackBar = inject(MatSnackBar);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  constructor() {
    this.sessionId = this.route.snapshot.paramMap.get('id')!;
    this.isAdmin = this.sessionService.sessionInformation!.admin;
    this.userId = this.sessionService.sessionInformation!.id;
  }

  ngOnInit(): void {
    this.loadSession$()
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      error: () => this.matSnackBar.open('Unable to load the session', 'Close', { duration: 3000 }),
    });
  }

  public back() {
    window.history.back();
  }

  public delete(): void {
    this.sessionApiService
      .delete(this.sessionId)
      .subscribe(() => {
          this.matSnackBar.open('Session deleted !', 'Close', { duration: 3000 });
          this.router.navigate(['sessions']);
        }
      );
  }

  public participate(): void {
  
    if (this.loading) {
      return;
    }
    this.loading = true;

    this.sessionApiService
      .participate(this.sessionId, this.userId.toString())
      .pipe(
        switchMap(() => this.loadSession$()),
        finalize(() => (this.loading = false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        error: () =>
          this.matSnackBar.open('Unable to join the session', 'Close', { duration: 3000 }),
      });
    
  }

  public unParticipate(): void {

    if (this.loading) {
      return;
    }
    this.loading = true;

    this.sessionApiService
      .unParticipate(this.sessionId, this.userId.toString())
      .pipe(
        switchMap(() => this.loadSession$()),
        finalize(() => (this.loading = false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        error: () =>
          this.matSnackBar.open('Unable to join the session', 'Close', { duration: 3000 }),
      });

  }

  private fetchSession(): void {
    this.sessionApiService
      .detail(this.sessionId)
      .subscribe((session: Session) => {
        this.session = session;
        this.isParticipate = session.users.some(u => u === this.sessionService.sessionInformation!.id);
        this.teacherService
          .detail(session.teacher_id.toString())
          .subscribe((teacher: Teacher) => this.teacher = teacher);
      });
  }

  private loadSession$(): Observable<Teacher> {
  return this.sessionApiService.detail(this.sessionId).pipe(
    tap((session) => {
      this.session = session;
      this.isParticipate = session.users.includes(this.userId);
    }),
    switchMap((session) => this.teacherService.detail(session.teacher_id.toString())),
    tap((teacher) => (this.teacher = teacher)),
  );
}

}
