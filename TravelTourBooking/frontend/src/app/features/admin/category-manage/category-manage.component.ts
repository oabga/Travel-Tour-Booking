import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CategoryService } from '../../../services/category.service';
import { CategoryResponse } from '../../../shared/models';

@Component({
  selector: 'app-category-manage',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3 class="mb-0"><i class="bi bi-tags me-2"></i>Quản lý danh mục</h3>
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
            <div class="col-md-4">
              <label class="form-label">Tên danh mục *</label>
              <input type="text" class="form-control" formControlName="cateName">
            </div>
            <div class="col-md-5">
              <label class="form-label">Mô tả</label>
              <input type="text" class="form-control" formControlName="description">
            </div>
            <div class="col-md-3">
              <button type="submit" class="btn btn-primary me-2" [disabled]="form.invalid">
                {{ editId ? 'Cập nhật' : 'Thêm' }}
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
          <tr><th>ID</th><th>Tên</th><th>Mô tả</th><th></th></tr>
        </thead>
        <tbody>
          @for (c of items; track c.cateId) {
            <tr>
              <td>{{ c.cateId }}</td>
              <td>{{ c.cateName }}</td>
              <td>{{ c.description }}</td>
              <td>
                <button class="btn btn-sm btn-outline-primary me-1" (click)="onEdit(c)">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" (click)="onDelete(c.cateId)">
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
export class CategoryManageComponent implements OnInit {
  items: CategoryResponse[] = [];
  showForm = false;
  editId: number | null = null;
  msg = '';
  msgOk = false;

  form = this.fb.nonNullable.group({
    cateName: ['', Validators.required],
    description: ['']
  });

  constructor(private fb: FormBuilder, private svc: CategoryService) {}

  ngOnInit(): void { this.load(); }

  load(): void { this.svc.getAll().subscribe(d => this.items = d); }

  openForm(): void {
    this.showForm = true;
    this.editId = null;
    this.form.reset({ cateName: '', description: '' });
  }

  onEdit(c: CategoryResponse): void {
    this.showForm = true;
    this.editId = c.cateId;
    this.form.patchValue({ cateName: c.cateName, description: c.description || '' });
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
