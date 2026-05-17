import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AccountService } from '../../services/account.service';
import { AuthService } from '../../core/services/auth.service';
import { CustomerProfile } from '../../shared/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container py-4">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <h3 class="mb-4"><i class="bi bi-person-circle me-2"></i>Hồ sơ cá nhân</h3>

          @if (loading) {
            <div class="spinner-overlay"><div class="spinner-border text-primary"></div></div>
          } @else {
            @if (msg) {
              <div class="alert" [class.alert-success]="msgOk" [class.alert-danger]="!msgOk">{{ msg }}</div>
            }

            <div class="card border-0 shadow-sm mb-4">
              <div class="card-body">
                <div class="d-flex align-items-center mb-4">
                  <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                       style="width:64px;height:64px;font-size:1.5rem">
                    <i class="bi bi-person"></i>
                  </div>
                  <div class="ms-3">
                    <h5 class="mb-0">{{ auth.user()?.email }}</h5>
                    <span class="badge bg-info">{{ auth.userRole() }}</span>
                  </div>
                </div>

                @if (bookingCount !== null) {
                  <div class="alert alert-info">
                    <i class="bi bi-journal-check me-2"></i>
                    Số booking trong năm {{ currentYear }}: <strong>{{ bookingCount }}</strong>
                  </div>
                }

                <form [formGroup]="form" (ngSubmit)="onSubmit()">
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label class="form-label">Họ và tên *</label>
                      <input type="text" class="form-control" formControlName="fullName">
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">Số điện thoại</label>
                      <input type="tel" class="form-control" formControlName="phone">
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">Ngày sinh</label>
                      <input type="date" class="form-control" formControlName="dateOfBirth">
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">Địa chỉ</label>
                      <input type="text" class="form-control" formControlName="address">
                    </div>
                  </div>
                  <button type="submit" class="btn btn-primary mt-3" [disabled]="saving || form.invalid">
                    @if (saving) {
                      <span class="spinner-border spinner-border-sm me-1"></span>
                    }
                    <i class="bi bi-check-circle me-1"></i>Cập nhật
                  </button>
                </form>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  form = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    phone: [''],
    dateOfBirth: [''],
    address: ['']
  });
  loading = true;
  saving = false;
  msg = '';
  msgOk = false;
  bookingCount: number | null = null;
  currentYear = new Date().getFullYear();

  constructor(
    private fb: FormBuilder,
    public auth: AuthService,
    private accountSvc: AccountService
  ) {}

  ngOnInit(): void {
    const id = this.auth.userId();
    if (!id) { this.loading = false; return; }

    this.accountSvc.getProfile(id).subscribe({
      next: (p: CustomerProfile) => {
        this.form.patchValue({
          fullName: p.fullName || '',
          phone: p.phone || '',
          dateOfBirth: p.dateOfBirth ? p.dateOfBirth.substring(0, 10) : '',
          address: p.address || ''
        });
        this.loading = false;
      },
      error: () => this.loading = false
    });

    this.accountSvc.getBookingCount(id, this.currentYear).subscribe({
      next: r => this.bookingCount = r.bookingCount,
      error: () => {}
    });
  }

  onSubmit(): void {
    const id = this.auth.userId();
    if (!id || this.form.invalid) return;
    this.saving = true;
    this.msg = '';

    const val = this.form.getRawValue();
    this.accountSvc.updateProfile(id, {
      fullName: val.fullName,
      phone: val.phone || undefined,
      dateOfBirth: val.dateOfBirth || undefined,
      address: val.address || undefined
    }).subscribe({
      next: () => {
        this.saving = false;
        this.msg = 'Cập nhật thành công!';
        this.msgOk = true;
      },
      error: err => {
        this.saving = false;
        this.msg = err.error?.message || 'Cập nhật thất bại.';
        this.msgOk = false;
      }
    });
  }
}
