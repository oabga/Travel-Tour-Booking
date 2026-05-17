import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { BookingService } from '../../../services/booking.service';
import { ScheduleService } from '../../../services/schedule.service';
import { AuthService } from '../../../core/services/auth.service';
import { AccountService } from '../../../services/account.service';
import { VoucherService } from '../../../services/voucher.service';
import { ScheduleResponse, CustomerList } from '../../../shared/models';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  template: `
    <div class="container py-4">
      <h3 class="mb-4"><i class="bi bi-cart-plus me-2"></i>Đặt tour</h3>

      @if (schedule) {
        <div class="alert alert-info shadow-sm border-0">
          <strong>Lịch khởi hành #{{ schedule.scheduleId }}</strong> —
          Ngày đi: {{ schedule.departureDate }} | Về: {{ schedule.returnDate }}
          | Còn {{ schedule.availableSlots }} chỗ
          @if (schedule.employeeName) {
            | HDV: {{ schedule.employeeName }}
          }
        </div>
      }

      @if (errorMsg) {
        <div class="alert alert-danger shadow-sm border-0">{{ errorMsg }}</div>
      }
      @if (successMsg) {
        <div class="alert alert-success shadow-sm border-0">
          {{ successMsg }}
          <a [routerLink]="['/bookings', createdBookingId]" class="alert-link ms-2">
            Xem chi tiết booking
          </a>
        </div>
      }

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="card border-0 shadow-sm mb-4">
          <div class="card-body">
            <div class="row g-3">
              @if (isAdminOrStaff) {
                <div class="col-md-12">
                  <label class="form-label text-primary fw-bold">Chọn khách hàng (Staff đặt hộ)</label>
                  <select class="form-select border-primary" formControlName="accountId">
                    <option [ngValue]="null">-- Chọn khách hàng --</option>
                    @for (c of customers; track c.accountId) {
                      <option [ngValue]="c.accountId">{{ c.fullName }} ({{ c.email }})</option>
                    }
                  </select>
                </div>
              }

              <div class="col-md-3">
                <label class="form-label">Số người</label>
                <input type="number" class="form-control" formControlName="numberOfPeople"
                       min="1" [max]="schedule?.availableSlots || 100"
                       (change)="onPeopleChange()">
              </div>

              <!-- VOUCHER SECTION -->
              <div class="col-md-3">
                <label class="form-label">Mã giảm giá</label>
                <div class="input-group">
                  <input type="text" class="form-control text-uppercase" [(ngModel)]="voucherCode" 
                         [ngModelOptions]="{standalone: true}" placeholder="NHẬP MÃ">
                  <button class="btn btn-outline-secondary" type="button" (click)="applyVoucher()" [disabled]="!voucherCode || applyingVoucher">
                    @if (applyingVoucher) {
                       <span class="spinner-border spinner-border-sm"></span>
                    } @else {
                       Áp dụng
                    }
                  </button>
                </div>
                @if (voucherMsg) {
                  <div class="small mt-1" [class.text-success]="voucherOk" [class.text-danger]="!voucherOk">
                    {{ voucherMsg }}
                  </div>
                }
              </div>

              <div class="col-md-3">
                <label class="form-label">Giảm giá (%)</label>
                <input type="number" class="form-control" formControlName="discountPercent"
                       min="0" max="100" [readonly]="!isAdminOrStaff">
                @if (!isAdminOrStaff) {
                  <small class="text-muted">Dùng mã để được giảm giá.</small>
                }
              </div>
              <div class="col-md-3">
                <label class="form-label">Ghi chú</label>
                <input type="text" class="form-control" formControlName="notes"
                       placeholder="Ghi chú (tùy chọn)">
              </div>
            </div>
          </div>
        </div>

        <!-- Passengers -->
        <h5 class="mb-3"><i class="bi bi-people me-2"></i>Danh sách hành khách</h5>

        <div formArrayName="passengers">
          @for (p of passengers.controls; track i; let i = $index) {
            <div class="card border-0 shadow-sm mb-3" [formGroupName]="i">
              <div class="card-body">
                <div class="d-flex justify-content-between mb-2">
                  <h6 class="mb-0 text-secondary">Hành khách {{ i + 1 }}</h6>
                  @if (passengers.length > 1) {
                    <button type="button" class="btn btn-sm btn-outline-danger border-0"
                            (click)="removePassenger(i)">
                      <i class="bi bi-trash"></i>
                    </button>
                  }
                </div>
                <div class="row g-3">
                  <div class="col-md-4">
                    <label class="form-label small text-muted">Họ tên *</label>
                    <input type="text" class="form-control" formControlName="passengerName">
                  </div>
                  <div class="col-md-2">
                    <label class="form-label small text-muted">Loại *</label>
                    <select class="form-select" formControlName="passengerType">
                      <option value="Adult">Người lớn</option>
                      <option value="Child">Trẻ em</option>
                    </select>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label small text-muted">CCCD/Hộ chiếu</label>
                    <input type="text" class="form-control" formControlName="passengerIdNumber"
                           placeholder="12 số CCCD">
                  </div>
                  <div class="col-md-3">
                    <label class="form-label small text-muted">SĐT</label>
                    <input type="text" class="form-control" formControlName="passengerPhone">
                  </div>
                  <div class="col-md-3">
                    <label class="form-label small text-muted">Ngày sinh</label>
                    <input type="date" class="form-control" formControlName="passengerDOB">
                  </div>
                  <div class="col-md-3">
                    <div class="form-check mt-4 pt-2">
                      <input type="checkbox" class="form-check-input"
                             formControlName="isPrimaryContact" [id]="'primary'+i">
                      <label class="form-check-label" [for]="'primary'+i">Liên hệ chính</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>

        <div class="d-flex gap-2 mb-4 mt-4">
          <button type="button" class="btn btn-outline-primary px-4 shadow-sm" (click)="addPassenger()">
            <i class="bi bi-plus-circle me-1"></i>Thêm hành khách
          </button>
          <button type="submit" class="btn btn-primary px-5 shadow-sm" [disabled]="loading || form.invalid">
            @if (loading) {
              <span class="spinner-border spinner-border-sm me-1"></span>
            }
            <i class="bi bi-check-circle me-1"></i>Xác nhận đặt tour
          </button>
        </div>
      </form>
    </div>
  `
})
export class BookingFormComponent implements OnInit {
  schedule: ScheduleResponse | null = null;
  loading = false;
  errorMsg = '';
  successMsg = '';
  createdBookingId = 0;
  isAdminOrStaff = false;
  customers: CustomerList[] = [];

  // Voucher properties
  voucherCode = '';
  voucherMsg = '';
  voucherOk = false;
  applyingVoucher = false;

  form = this.fb.group({
    accountId: [null as number | null],
    numberOfPeople: [1, [Validators.required, Validators.min(1)]],
    discountPercent: [0, [Validators.min(0), Validators.max(100)]],
    notes: [''],
    passengers: this.fb.array([this.createPassenger()])
  });

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private bookingSvc: BookingService,
    private scheduleSvc: ScheduleService,
    private auth: AuthService,
    private accountSvc: AccountService,
    private voucherSvc: VoucherService
  ) {
    const role = this.auth.userRole();
    this.isAdminOrStaff = role === 'Admin' || role === 'Staff';
  }

  ngOnInit(): void {
    const scheduleId = Number(this.route.snapshot.paramMap.get('scheduleId'));
    this.scheduleSvc.getById(scheduleId).subscribe({
      next: s => this.schedule = s,
      error: () => this.errorMsg = 'Không tìm thấy lịch khởi hành.'
    });

    if (this.isAdminOrStaff) {
      this.accountSvc.getAllCustomers().subscribe(data => this.customers = data);
      this.form.controls.accountId.setValidators(Validators.required);
    } else {
      this.form.controls.discountPercent.disable();
    }
  }

  applyVoucher(): void {
    if (!this.voucherCode) return;
    this.applyingVoucher = true;
    this.voucherMsg = '';

    this.voucherSvc.validate(this.voucherCode).subscribe({
      next: res => {
        this.applyingVoucher = false;
        if (res.isValid) {
          this.voucherOk = true;
          this.voucherMsg = res.message;
          this.form.patchValue({ discountPercent: res.discountPercent });
        } else {
          this.voucherOk = false;
          this.voucherMsg = res.message;
          this.form.patchValue({ discountPercent: 0 });
        }
      },
      error: () => {
        this.applyingVoucher = false;
        this.voucherOk = false;
        this.voucherMsg = 'Không thể kiểm tra mã lúc này.';
      }
    });
  }

  get passengers(): FormArray {
    return this.form.get('passengers') as FormArray;
  }

  createPassenger() {
    return this.fb.group({
      passengerName: ['', Validators.required],
      passengerType: ['Adult' as 'Adult' | 'Child'],
      passengerIdNumber: [''],
      passengerPhone: [''],
      passengerDOB: [''],
      isPrimaryContact: [false]
    });
  }

  addPassenger(): void {
    this.passengers.push(this.createPassenger());
    this.form.patchValue({ numberOfPeople: this.passengers.length });
  }

  removePassenger(i: number): void {
    this.passengers.removeAt(i);
    this.form.patchValue({ numberOfPeople: this.passengers.length });
  }

  onPeopleChange(): void {
    const num = this.form.value.numberOfPeople || 1;
    while (this.passengers.length < num) this.passengers.push(this.createPassenger());
    while (this.passengers.length > num) this.passengers.removeAt(this.passengers.length - 1);
  }

  onSubmit(): void {
    if (this.form.invalid || !this.schedule) return;
    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';

    const val = this.form.getRawValue();
    let finalAccountId = val.accountId;

    if (!this.isAdminOrStaff) {
      finalAccountId = this.auth.userId();
    }

    if (!finalAccountId) {
      this.errorMsg = 'Không xác định được tài khoản khách hàng.';
      this.loading = false;
      return;
    }

    const passengers = val.passengers;
    const primaryContacts = passengers.filter(p => !!p.isPrimaryContact);

    if (primaryContacts.length === 0) {
      this.errorMsg = 'Phải chọn ít nhất 1 hành khách làm liên hệ chính.';
      this.loading = false;
      return;
    }
    if (primaryContacts.length > 1) {
      this.errorMsg = 'Chỉ được phép chọn duy nhất 1 hành khách làm liên hệ chính.';
      this.loading = false;
      return;
    }

    const primary = primaryContacts[0];
    if (!primary.passengerPhone || !primary.passengerPhone.trim()) {
      this.errorMsg = `Người liên hệ chính (${primary.passengerName || 'Hành khách'}) phải có số điện thoại liên lạc.`;
      this.loading = false;
      return;
    }

    if (primary.passengerType !== 'Adult') {
      this.errorMsg = 'Người liên hệ chính (IsPrimaryContact) bắt buộc phải là người lớn (Adult).';
      this.loading = false;
      return;
    }

    const hasAdult = passengers.some(p => p.passengerType === 'Adult');
    if (!hasAdult) {
      this.errorMsg = 'Đoàn hành khách đặt tour bắt buộc phải có ít nhất một người lớn (Adult) đi kèm.';
      this.loading = false;
      return;
    }

    const today = new Date();
    for (const p of passengers) {
      if (!p.passengerDOB) {
        this.errorMsg = `Hành khách '${p.passengerName || 'không tên'}' bắt buộc phải nhập Ngày sinh.`;
        this.loading = false;
        return;
      }

      const dob = new Date(p.passengerDOB);
      if (dob > today) {
        this.errorMsg = `Ngày sinh của hành khách '${p.passengerName}' không được nằm ở tương lai.`;
        this.loading = false;
        return;
      }

      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }

      if (p.passengerType === 'Child' && age >= 12) {
        this.errorMsg = `Hành khách '${p.passengerName}' được chọn là Trẻ em nhưng ngày sinh thể hiện đã ${age} tuổi. Trẻ em phải dưới 12 tuổi.`;
        this.loading = false;
        return;
      }

      if (p.passengerType === 'Adult' && age < 12) {
        this.errorMsg = `Hành khách '${p.passengerName}' được chọn là Người lớn nhưng ngày sinh thể hiện mới ${age} tuổi. Người lớn phải từ 12 tuổi trở lên.`;
        this.loading = false;
        return;
      }
    }

    this.bookingSvc.create({
      accountId: finalAccountId,
      scheduleId: this.schedule.scheduleId,
      numberOfPeople: val.numberOfPeople ?? 0,
      discountPercent: val.discountPercent ?? 0,
      notes: val.notes || undefined,
      passengers: val.passengers.map(p => ({
        passengerName: p.passengerName ?? '',
        passengerType: p.passengerType as 'Adult' | 'Child',
        passengerIdNumber: p.passengerIdNumber || undefined,
        passengerPhone: p.passengerPhone || undefined,
        passengerDOB: p.passengerDOB || undefined,
        isPrimaryContact: !!p.isPrimaryContact
      }))
    }).subscribe({
      next: res => {
        this.loading = false;
        this.successMsg = 'Đặt tour thành công!';
        this.createdBookingId = res.bookingId;
      },
      error: err => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'Đặt tour thất bại. Vui lòng thử lại.';
      }
    });
  }
}

