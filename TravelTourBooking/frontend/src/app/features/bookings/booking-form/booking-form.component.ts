import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { BookingService } from '../../../services/booking.service';
import { ScheduleService } from '../../../services/schedule.service';
import { AuthService } from '../../../core/services/auth.service';
import { ScheduleResponse } from '../../../shared/models';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container py-4">
      <h3 class="mb-4"><i class="bi bi-cart-plus me-2"></i>Dat tour</h3>

      @if (schedule) {
        <div class="alert alert-info">
          <strong>Lich khoi hanh #{{ schedule.scheduleId }}</strong> —
          Ngay di: {{ schedule.departureDate }} | Ve: {{ schedule.returnDate }}
          | Con {{ schedule.availableSlots }} cho
          @if (schedule.employeeName) {
            | HDV: {{ schedule.employeeName }}
          }
        </div>
      }

      @if (errorMsg) {
        <div class="alert alert-danger">{{ errorMsg }}</div>
      }
      @if (successMsg) {
        <div class="alert alert-success">
          {{ successMsg }}
          <a [routerLink]="['/bookings', createdBookingId]" class="alert-link ms-2">
            Xem chi tiet booking
          </a>
        </div>
      }

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="card border-0 shadow-sm mb-4">
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-4">
                <label class="form-label">So nguoi</label>
                <input type="number" class="form-control" formControlName="numberOfPeople"
                       min="1" [max]="schedule?.availableSlots || 100"
                       (change)="onPeopleChange()">
              </div>
              <div class="col-md-4">
                <label class="form-label">Giam gia (%)</label>
                <input type="number" class="form-control" formControlName="discountPercent"
                       min="0" max="100">
              </div>
              <div class="col-md-4">
                <label class="form-label">Ghi chu</label>
                <input type="text" class="form-control" formControlName="notes"
                       placeholder="Ghi chu (tuy chon)">
              </div>
            </div>
          </div>
        </div>

        <!-- Passengers -->
        <h5 class="mb-3"><i class="bi bi-people me-2"></i>Danh sach hanh khach</h5>

        <div formArrayName="passengers">
          @for (p of passengers.controls; track i; let i = $index) {
            <div class="card border-0 shadow-sm mb-3" [formGroupName]="i">
              <div class="card-body">
                <div class="d-flex justify-content-between mb-2">
                  <h6 class="mb-0">Hanh khach {{ i + 1 }}</h6>
                  @if (passengers.length > 1) {
                    <button type="button" class="btn btn-sm btn-outline-danger"
                            (click)="removePassenger(i)">
                      <i class="bi bi-trash"></i>
                    </button>
                  }
                </div>
                <div class="row g-3">
                  <div class="col-md-4">
                    <label class="form-label">Ho ten *</label>
                    <input type="text" class="form-control" formControlName="passengerName">
                  </div>
                  <div class="col-md-2">
                    <label class="form-label">Loai *</label>
                    <select class="form-select" formControlName="passengerType">
                      <option value="Adult">Nguoi lon</option>
                      <option value="Child">Tre em</option>
                    </select>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">CCCD/Ho chieu</label>
                    <input type="text" class="form-control" formControlName="passengerIdNumber"
                           placeholder="12 so CCCD">
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">SDT</label>
                    <input type="text" class="form-control" formControlName="passengerPhone">
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">Ngay sinh</label>
                    <input type="date" class="form-control" formControlName="passengerDOB">
                  </div>
                  <div class="col-md-3">
                    <div class="form-check mt-4">
                      <input type="checkbox" class="form-check-input"
                             formControlName="isPrimaryContact" [id]="'primary'+i">
                      <label class="form-check-label" [for]="'primary'+i">Lien he chinh</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>

        <div class="d-flex gap-2 mb-4">
          <button type="button" class="btn btn-outline-primary" (click)="addPassenger()">
            <i class="bi bi-plus-circle me-1"></i>Them hanh khach
          </button>
          <button type="submit" class="btn btn-primary" [disabled]="loading || form.invalid">
            @if (loading) {
              <span class="spinner-border spinner-border-sm me-1"></span>
            }
            <i class="bi bi-check-circle me-1"></i>Xac nhan dat tour
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

  form = this.fb.group({
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
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    const scheduleId = Number(this.route.snapshot.paramMap.get('scheduleId'));
    this.scheduleSvc.getById(scheduleId).subscribe({
      next: s => this.schedule = s,
      error: () => this.errorMsg = 'Khong tim thay lich khoi hanh.'
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

    const userId = this.auth.userId();
    if (!userId) { this.errorMsg = 'Khong xac dinh duoc tai khoan.'; this.loading = false; return; }

    const val = this.form.getRawValue();
    this.bookingSvc.create({
      accountId: userId,
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
        this.successMsg = 'Dat tour thanh cong!';
        this.createdBookingId = res.bookingId;
      },
      error: err => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'Dat tour that bai. Vui long thu lai.';
      }
    });
  }
}
