import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ScheduleService } from '../../../services/schedule.service';
import { EmployeeService } from '../../../services/employee.service';
import { TourService } from '../../../services/tour.service';
import { ScheduleResponse, EmployeeDto, TourList } from '../../../shared/models';

@Component({
  selector: 'app-schedule-manage',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3 class="mb-0"><i class="bi bi-calendar-event me-2"></i>Quan ly lich khoi hanh</h3>
      <button class="btn btn-primary" (click)="openForm()">
        <i class="bi bi-plus-circle me-1"></i>Them
      </button>
    </div>

    @if (msg) {
      <div class="alert" [class.alert-success]="msgOk" [class.alert-danger]="!msgOk">{{ msg }}</div>
    }

    @if (showForm) {
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body">
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="row g-3 align-items-end">
            <div class="col-md-3">
              <label class="form-label">Tour *</label>
              <select class="form-select" formControlName="tourId">
                @for (t of tours; track t.tourId) {
                  <option [ngValue]="t.tourId">{{ t.tourName }}</option>
                }
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label">Ngay di *</label>
              <input type="date" class="form-control" formControlName="departureDate">
            </div>
            <div class="col-md-2">
              <label class="form-label">Ngay ve *</label>
              <input type="date" class="form-control" formControlName="returnDate">
            </div>
            <div class="col-md-2">
              <label class="form-label">So cho *</label>
              <input type="number" class="form-control" formControlName="availableSlots">
            </div>
            <div class="col-md-2">
              <label class="form-label">Huong dan vien</label>
              <select class="form-select" formControlName="employeeId">
                <option [ngValue]="null">-- Khong --</option>
                @for (e of employees; track e.employeeId) {
                  <option [ngValue]="e.employeeId">{{ e.fullName }}</option>
                }
              </select>
            </div>
            <div class="col-md-1">
              <button type="submit" class="btn btn-primary" [disabled]="form.invalid">Luu</button>
            </div>
          </form>
        </div>
      </div>
    }

    <div class="table-responsive">
      <table class="table table-hover align-middle">
        <thead class="table-light">
          <tr>
            <th>ID</th><th>Tour</th><th>Ngay di</th><th>Ngay ve</th>
            <th>Cho trong</th><th>HDV</th><th></th>
          </tr>
        </thead>
        <tbody>
          @for (s of items; track s.scheduleId) {
            <tr>
              <td>{{ s.scheduleId }}</td>
              <td>{{ getTourName(s.tourId) }}</td>
              <td>{{ s.departureDate }}</td>
              <td>{{ s.returnDate }}</td>
              <td>{{ s.availableSlots }}</td>
              <td>{{ s.employeeName || '—' }}</td>
              <td>
                <button class="btn btn-sm btn-outline-primary me-1" (click)="onEdit(s)">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" (click)="onDelete(s.scheduleId)">
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `
})
export class ScheduleManageComponent implements OnInit {
  items: ScheduleResponse[] = [];
  tours: TourList[] = [];
  employees: EmployeeDto[] = [];
  showForm = false;
  editId: number | null = null;
  msg = '';
  msgOk = false;

  form = this.fb.nonNullable.group({
    tourId: [0, Validators.required],
    departureDate: ['', Validators.required],
    returnDate: ['', Validators.required],
    availableSlots: [1, [Validators.required, Validators.min(1)]],
    employeeId: [null as number | null]
  });

  constructor(
    private fb: FormBuilder,
    private svc: ScheduleService,
    private tourSvc: TourService,
    private empSvc: EmployeeService
  ) {}

  ngOnInit(): void {
    this.load();
    this.tourSvc.getAll(1, 100).subscribe(r => this.tours = r.items);
    this.empSvc.getAll().subscribe(e => this.employees = e);
  }

  load(): void { this.svc.getAll().subscribe(d => this.items = d); }

  getTourName(tourId: number | null): string {
    return this.tours.find(t => t.tourId === tourId)?.tourName || `Tour #${tourId}`;
  }

  openForm(): void {
    this.showForm = true; this.editId = null;
    this.form.reset({ tourId: 0, departureDate: '', returnDate: '', availableSlots: 1, employeeId: null });
  }

  onEdit(s: ScheduleResponse): void {
    this.showForm = true; this.editId = s.scheduleId;
    this.form.patchValue({
      tourId: s.tourId || 0,
      departureDate: s.departureDate || '',
      returnDate: s.returnDate || '',
      availableSlots: s.availableSlots,
      employeeId: s.employeeId
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const dto = this.form.getRawValue();
    const obs = this.editId
      ? this.svc.update(this.editId, { ...dto, employeeId: dto.employeeId ?? undefined })
      : this.svc.create({ ...dto, employeeId: dto.employeeId ?? undefined });
    obs.subscribe({
      next: () => { this.msg = 'Thanh cong!'; this.msgOk = true; this.showForm = false; this.load(); },
      error: err => { this.msg = err.error?.message || 'Loi.'; this.msgOk = false; }
    });
  }

  onDelete(id: number): void {
    if (!confirm('Xac nhan xoa?')) return;
    this.svc.delete(id).subscribe({
      next: () => { this.msg = 'Da xoa.'; this.msgOk = true; this.load(); },
      error: err => { this.msg = err.error?.message || 'Xoa that bai.'; this.msgOk = false; }
    });
  }
}
