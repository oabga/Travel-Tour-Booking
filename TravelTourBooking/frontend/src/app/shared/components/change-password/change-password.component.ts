import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-change-password',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="container py-4">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card shadow-sm border-0">
            <div class="card-body p-4">
              <h4 class="mb-4 text-center"><i class="bi bi-shield-lock me-2"></i>Đổi mật khẩu</h4>
              
              @if (msg) {
                <div class="alert" [class.alert-success]="msgOk" [class.alert-danger]="!msgOk">{{ msg }}</div>
              }

              <form [formGroup]="form" (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label class="form-label">Mật khẩu hiện tại</label>
                  <input type="password" class="form-control" formControlName="oldPassword">
                </div>
                <div class="mb-3">
                  <label class="form-label">Mật khẩu mới</label>
                  <input type="password" class="form-control" formControlName="newPassword">
                </div>
                <div class="mb-4">
                  <label class="form-label">Xác nhận mật khẩu mới</label>
                  <input type="password" class="form-control" formControlName="confirmPassword">
                  @if (form.errors?.['mismatch'] && form.get('confirmPassword')?.touched) {
                    <small class="text-danger">Mật khẩu xác nhận không khớp.</small>
                  }
                </div>

                <button type="submit" class="btn btn-primary w-100" [disabled]="loading || form.invalid">
                  @if (loading) { <span class="spinner-border spinner-border-sm me-2"></span> }
                  Đổi mật khẩu
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ChangePasswordComponent {
    form = this.fb.nonNullable.group({
        oldPassword: ['', Validators.required],
        newPassword: ['', Validators.required],
        confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    loading = false;
    msg = '';
    msgOk = false;

    constructor(private fb: FormBuilder, private auth: AuthService) { }

    passwordMatchValidator(g: any) {
        return g.get('newPassword').value === g.get('confirmPassword').value
            ? null : { mismatch: true };
    }

    onSubmit(): void {
        if (this.form.invalid) return;
        this.loading = true;
        this.msg = '';

        const val = this.form.getRawValue();
        this.auth.changePassword({ oldPassword: val.oldPassword, newPassword: val.newPassword }).subscribe({
            next: () => {
                this.loading = false;
                this.msgOk = true;
                this.msg = 'Đổi mật khẩu thành công!';
                this.form.reset();
            },
            error: (err) => {
                this.loading = false;
                this.msgOk = false;
                this.msg = err.error?.message || 'Đổi mật khẩu thất bại. Sai mật khẩu cũ?';
            }
        });
    }
}
