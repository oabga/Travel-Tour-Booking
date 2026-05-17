import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DestinationService } from '../../../services/destination.service';
import { DestinationResponse } from '../../../shared/models';

@Component({
  selector: 'app-destination-manage',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3 class="mb-0"><i class="bi bi-geo-alt me-2"></i>Quản lý điểm đến</h3>
      <button class="btn btn-primary" (click)="openForm()">
        <i class="bi bi-plus-circle me-1"></i>Thêm
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
              <label class="form-label">Tên điểm đến *</label>
              <input type="text" class="form-control" formControlName="desName">
            </div>
            <div class="col-md-2">
              <label class="form-label">Quốc gia</label>
              <input type="text" class="form-control" formControlName="country">
            </div>
            <div class="col-md-2">
              <label class="form-label">Thành phố</label>
              <input type="text" class="form-control" formControlName="city">
            </div>
            <div class="col-md-3">
              <label class="form-label">Mô tả</label>
              <input type="text" class="form-control" formControlName="description">
            </div>
            <div class="col-md-2">
              <button type="submit" class="btn btn-primary me-1" [disabled]="form.invalid">
                {{ editId ? 'Lưu' : 'Thêm' }}
              </button>
              <button type="button" class="btn btn-secondary" (click)="showForm=false">Hủy</button>
            </div>
          </form>
        </div>
      </div>
    }

    <div class="table-responsive">
      <table class="table table-hover align-middle">
        <thead class="table-light">
          <tr><th>ID</th><th>Tên</th><th>Quốc gia</th><th>Thành phố</th><th>Mô tả</th><th></th></tr>
        </thead>
        <tbody>
          @for (d of items; track d.desId) {
            <tr>
              <td>{{ d.desId }}</td>
              <td>{{ d.desName }}</td>
              <td>{{ d.country }}</td>
              <td>{{ d.city }}</td>
              <td>{{ d.description }}</td>
              <td>
                <button class="btn btn-sm btn-outline-primary me-1" (click)="onEdit(d)">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" (click)="onDelete(d.desId)">
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
export class DestinationManageComponent implements OnInit {
  items: DestinationResponse[] = [];
  showForm = false;
  editId: number | null = null;
  msg = '';
  msgOk = false;

  form = this.fb.nonNullable.group({
    desName: ['', Validators.required],
    country: [''],
    city: [''],
    description: ['']
  });

  constructor(private fb: FormBuilder, private svc: DestinationService) {}

  ngOnInit(): void { this.load(); }
  load(): void { this.svc.getAll().subscribe(d => this.items = d); }

  openForm(): void {
    this.showForm = true; this.editId = null;
    this.form.reset({ desName: '', country: '', city: '', description: '' });
  }

  onEdit(d: DestinationResponse): void {
    this.showForm = true; this.editId = d.desId;
    this.form.patchValue({ desName: d.desName || '', country: d.country || '', city: d.city || '', description: d.description || '' });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const dto = this.form.getRawValue();
    const obs = this.editId ? this.svc.update(this.editId, dto) : this.svc.create(dto);
    obs.subscribe({
      next: () => { this.msg = 'Thành công!'; this.msgOk = true; this.showForm = false; this.load(); },
      error: err => { this.msg = err.error?.message || 'Lỗi.'; this.msgOk = false; }
    });
  }

  onDelete(id: number): void {
    if (!confirm('Xác nhận xóa?')) return;
    this.svc.delete(id).subscribe({
      next: () => { this.msg = 'Đã xóa.'; this.msgOk = true; this.load(); },
      error: err => { this.msg = err.error?.message || 'Xóa thất bại.'; this.msgOk = false; }
    });
  }
}
