import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card shadow-sm border-0">
            <div class="card-body p-4">
              <h3 class="text-center mb-4">
                <i class="bi bi-person-plus me-2"></i>Đăng ký tài khoản
              </h3>

              @if (errorMsg) {
                <div class="alert alert-danger">{{ errorMsg }}</div>
              }

              <form [formGroup]="form" (ngSubmit)="onSubmit()">
                <div class="form-floating mb-3">
                  <input type="text" class="form-control" id="fullName"
                         formControlName="fullName" placeholder="Họ và tên">
                  <label for="fullName">Họ và tên</label>
                  @if (form.get('fullName')?.touched && form.get('fullName')?.errors?.['required']) {
                    <small class="text-danger">Họ tên là bắt buộc.</small>
                  }
                </div>

                <div class="form-floating mb-3">
                  <input type="email" class="form-control" id="email"
                         formControlName="email" placeholder="Email">
                  <label for="email">Email</label>
                  @if (form.get('email')?.touched && form.get('email')?.errors?.['email']) {
                    <small class="text-danger">Email không hợp lệ.</small>
                  }
                </div>

                <div class="form-floating mb-3">
                  <input type="password" class="form-control" id="password"
                         formControlName="password" placeholder="Mật khẩu">
                  <label for="password">Mật khẩu (ít nhất 6 ký tự)</label>
                  @if (form.get('password')?.touched && form.get('password')?.errors?.['minlength']) {
                    <small class="text-danger">Mật khẩu tối thiểu 6 ký tự.</small>
                  }
                </div>

                <div class="form-floating mb-3">
                  <input type="tel" class="form-control" id="phone"
                         formControlName="phone" placeholder="Số điện thoại">
                  <label for="phone">Số điện thoại</label>
                </div>

                <div class="form-floating mb-3">
                  <input type="date" class="form-control" id="dateOfBirth"
                         formControlName="dateOfBirth" placeholder="Ngày sinh">
                  <label for="dateOfBirth">Ngày sinh</label>
                </div>

                <div class="form-floating mb-3">
                  <input type="text" class="form-control" id="address"
                         formControlName="address" placeholder="Địa chỉ">
                  <label for="address">Địa chỉ</label>
                </div>

                <button type="submit" class="btn btn-primary w-100 py-2"
                        [disabled]="loading || form.invalid">
                  @if (loading) {
                    <span class="spinner-border spinner-border-sm me-2"></span>
                  }
                  Đăng ký
                </button>
              </form>

              <p class="text-center mt-3 mb-0">
                Đã có tài khoản?
                <a routerLink="/login" class="text-decoration-none">Đăng nhập</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  form = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    phone: [''],
    dateOfBirth: [''],
    address: ['']
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

    const val = this.form.getRawValue();
    this.auth.register({
      ...val,
      dateOfBirth: val.dateOfBirth || undefined,
      phone: val.phone || undefined,
      address: val.address || undefined
    }).subscribe({
      next: () => this.router.navigate(['/tours']),
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'Đăng ký thất bại.';
      }
    });
  }
}
