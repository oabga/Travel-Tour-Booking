import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-5">
          <div class="card shadow-sm border-0">
            <div class="card-body p-4">
              <h3 class="text-center mb-4">
                <i class="bi bi-box-arrow-in-right me-2"></i>Dang nhap
              </h3>

              @if (errorMsg) {
                <div class="alert alert-danger">{{ errorMsg }}</div>
              }

              <form [formGroup]="form" (ngSubmit)="onSubmit()">
                <div class="form-floating mb-3">
                  <input type="email" class="form-control" id="email"
                         formControlName="email" placeholder="Email">
                  <label for="email">Email</label>
                  @if (form.get('email')?.touched && form.get('email')?.errors?.['required']) {
                    <small class="text-danger">Email la bat buoc.</small>
                  }
                </div>

                <div class="form-floating mb-3">
                  <input type="password" class="form-control" id="password"
                         formControlName="password" placeholder="Mat khau">
                  <label for="password">Mat khau</label>
                  @if (form.get('password')?.touched && form.get('password')?.errors?.['required']) {
                    <small class="text-danger">Mat khau la bat buoc.</small>
                  }
                </div>

                <button type="submit" class="btn btn-primary w-100 py-2"
                        [disabled]="loading || form.invalid">
                  @if (loading) {
                    <span class="spinner-border spinner-border-sm me-2"></span>
                  }
                  Dang nhap
                </button>
              </form>

              <p class="text-center mt-3 mb-0">
                Chua co tai khoan?
                <a routerLink="/register" class="text-decoration-none">Dang ky ngay</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });
  loading = false;
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMsg = '';

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        const role = this.auth.userRole();
        if (role === 'Admin') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/tours']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'Dang nhap that bai. Vui long thu lai.';
      }
    });
  }
}
