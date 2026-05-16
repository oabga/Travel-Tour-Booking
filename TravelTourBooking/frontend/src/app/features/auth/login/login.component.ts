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

              @if (showChangePassword) {
                <h3 class="text-center mb-4">
                  <i class="bi bi-shield-lock me-2"></i>Đổi mật khẩu
                </h3>
                <div class="alert alert-warning">Bạn đang sử dụng mật khẩu mặc định. Vui lòng đổi mật khẩu mới để bảo vệ tài khoản.</div>
                
                @if (errorMsg) {
                  <div class="alert alert-danger">{{ errorMsg }}</div>
                }

                <form [formGroup]="changePasswordForm" (ngSubmit)="onChangePasswordSubmit()">
                  <div class="form-floating mb-3">
                    <input type="password" class="form-control" id="oldPassword"
                           formControlName="oldPassword" placeholder="Mật khẩu cũ">
                    <label for="oldPassword">Mật khẩu cũ (Mặc định)</label>
                  </div>

                  <div class="form-floating mb-3">
                    <input type="password" class="form-control" id="newPassword"
                           formControlName="newPassword" placeholder="Mật khẩu mới">
                    <label for="newPassword">Mật khẩu mới</label>
                  </div>

                  <button type="submit" class="btn btn-warning w-100 py-2"
                          [disabled]="loading || changePasswordForm.invalid">
                    @if (loading) {
                      <span class="spinner-border spinner-border-sm me-2"></span>
                    }
                    Xác nhận đổi mật khẩu
                  </button>
                </form>
              } @else {
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
              }
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

  changePasswordForm = this.fb.nonNullable.group({
    oldPassword: ['', Validators.required],
    newPassword: ['', Validators.required]
  });

  loading = false;
  errorMsg = '';
  showChangePassword = false;

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
      next: (res: any) => {
        this.loading = false;
        
        // Kiểm tra xem backend có yêu cầu đổi mật khẩu không
        if (res.requirePasswordChange) {
          this.showChangePassword = true;
          // Gán sẵn mật khẩu cũ để người dùng đỡ phải gõ lại
          this.changePasswordForm.patchValue({ oldPassword: this.form.getRawValue().password });
          return;
        }

        this.navigateToRole();
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'Dang nhap that bai. Vui long thu lai.';
      }
    });
  }

  onChangePasswordSubmit(): void {
    if (this.changePasswordForm.invalid) return;
    this.loading = true;
    this.errorMsg = '';

    this.auth.changePassword(this.changePasswordForm.getRawValue()).subscribe({
      next: () => {
        this.loading = false;
        alert('Đổi mật khẩu thành công! Chào mừng bạn.');
        this.navigateToRole();
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'Đổi mật khẩu thất bại!';
      }
    });
  }

  private navigateToRole(): void {
    const role = this.auth.userRole();
    if (role === 'Admin') {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/tours']);
    }
  }
}
