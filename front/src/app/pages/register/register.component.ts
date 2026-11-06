import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/service/auth.service';
import { RegisterRequest } from '../../core/models/registerRequest.interface';
import { MaterialModule } from "../../shared/material.module";

@Component({
  selector: 'app-register',
  imports: [MaterialModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  public onError = false;
  public loading = false;

  public form = this.fb.group({
    email: [
      '',
      [
        Validators.required,
        Validators.email
      ]
    ],
    firstName: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20)
      ]
    ],
    lastName: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20)
      ]
    ],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(40)
      ]
    ]
  });


  public submit(): void {

    if (this.form.invalid || this.loading) {
      return;
    }

    this.onError = false;
    this.loading = true;

    const registerRequest = this.form.value as RegisterRequest;
    this.authService.register(registerRequest).subscribe({
        next: () => this.router.navigate(['/login']),
        error: () => {
          this.onError = true;
          this.loading = false;
        },
      }
    );
  }

}
