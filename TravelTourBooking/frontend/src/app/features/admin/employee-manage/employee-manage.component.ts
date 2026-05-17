import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { EmployeeService } from '../../../services/employee.service';
import { RoleService, RoleDto } from '../../../services/role.service';
import { AuthService } from '../../../core/services/auth.service';
import { EmployeeDto } from '../../../shared/models';

@Component({
  selector: 'app-employee-manage',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3 class="mb-0"><i class="bi bi-person-badge me-2"></i>Quan ly nhan vien / HDV</h3>
      <button class="btn btn-primary" (click)="openForm()">
        <i class="bi bi-plus-circle me-1"></i>Them
      </button>
    </div>

    @if (msg) {
      <div class="alert shadow-sm" [class.alert-success]="msgOk" [class.alert-danger]="!msgOk">{{ msg }}</div>
    }

    @if (showForm) {
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body">
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="row g-3 align-items-end">
            <div class="col-md-3">
              <label class="form-label">Họ tên *</label>
              <input type="text" class="form-control" formControlName="fullName">
            </div>
            <div class="col-md-2">
              <label class="form-label">Vai trò *</label>
              <select class="form-select" formControlName="role">
                <option value="">-- Chọn vai trò --</option>
                @for (r of roles; track r.roleId) {
                  <option [value]="r.roleName">{{ r.roleName }}</option>
                }
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label">SĐT</label>
              <input type="text" class="form-control" formControlName="phone">
            </div>
            <div class="col-md-2">
              <label class="form-label">Email *</label>
              <input type="email" class="form-control" formControlName="email">
            </div>
            <!-- Chỉ hiện field mật khẩu khi tạo mới (chưa có editId) -->
            @if (!editId) {
              <div class="col-md-2">
                <label class="form-label">Mật khẩu *</label>
                <input type="password" class="form-control" formControlName="password">
              </div>
            }
            <div class="col-md-12 mt-3">
              <button type="submit" class="btn btn-primary me-1 px-4" [disabled]="form.invalid">
                {{ editId ? 'Lưu thay đổi' : 'Tạo tài khoản' }}
              </button>
              <button type="button" class="btn btn-light border" (click)="showForm=false">Hủy</button>
            </div>
          </form>
        </div>
      </div>
      }

    <div class="table-responsive">
      <table class="table table-hover align-middle shadow-sm bg-white rounded">
        <thead class="table-light">
          <tr><th>ID</th><th>Ho ten</th><th>Vai tro</th><th>SDT</th><th>Email</th><th></th></tr>
        </thead>
        <tbody>
          @for (e of items; track e.employeeId) {
            <tr>
              <td><span class="badge bg-light text-dark border">{{ e.employeeId }}</span></td>
              <td class="fw-semibold">{{ e.fullName }}</td>
              <td>
                <span class="badge" [ngClass]="{
                  'bg-danger': e.role === 'Admin',
                  'bg-info': e.role === 'Staff',
                  'bg-success': e.role === 'Guide' || e.role === 'Manager'
                }">{{ e.role }}</span>
              </td>
              <td>{{ e.phone }}</td>
              <td>{{ e.email }}</td>
              <td>
                <button class="btn btn-sm btn-outline-primary me-1 border-0" (click)="onEdit(e)">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger border-0" (click)="onDelete(e.employeeId)">
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
export class EmployeeManageComponent implements OnInit {
    items: EmployeeDto[] = [];
    roles: RoleDto[] = [];
    showForm = false;
    editId: number | null = null;
    msg = '';
    msgOk = false;
    form = this.fb.nonNullable.group({
        fullName: ['', Validators.required],
        role: ['', Validators.required],
        phone: [''],
        email: ['', [Validators.required, Validators.email]],
        password: ['']
    });
    constructor(
        private fb: FormBuilder,
        private svc: EmployeeService,
        private roleSvc: RoleService,
        private authSvc: AuthService
    ) { }
    ngOnInit(): void { 
        this.load();
        this.roleSvc.getAll().subscribe(d => this.roles = d);
    }
    load(): void { this.svc.getAll().subscribe(d => this.items = d); }
    openForm(): void {
        this.showForm = true; this.editId = null;
        this.form.reset({ fullName: '', role: 'Staff', phone: '', email: '', password: '' });
        // Yêu cầu mật khẩu khi tạo mới
        this.form.get('password')?.setValidators(Validators.required);
        this.form.get('password')?.updateValueAndValidity();
    }
    onEdit(e: EmployeeDto): void {
        this.showForm = true; this.editId = e.employeeId;
        this.form.patchValue({ fullName: e.fullName || '', role: e.role || '', phone: e.phone || '', email: e.email || '', password: '' });
        // Không yêu cầu mật khẩu khi edit
        this.form.get('password')?.clearValidators();
        this.form.get('password')?.updateValueAndValidity();
    }
    onSubmit(): void {
        if (this.form.invalid) return;
        const val = this.form.getRawValue();
        if (this.editId) {
            // Trường hợp Cập nhật Employee (Không cập nhật mật khẩu ở đây)
            const dto: EmployeeDto = { employeeId: this.editId, ...val };
            this.svc.update(this.editId, dto).subscribe({
                next: () => { this.msg = 'Cập nhật thành công!'; this.msgOk = true; this.showForm = false; this.load(); },
                error: err => { this.msg = err.error?.message || 'Cập nhật lỗi.'; this.msgOk = false; }
            });
        } else {
            // Trường hợp Tạo tài khoản Staff mới
            this.authSvc.registerStaff(val).subscribe({
                next: () => { this.msg = 'Tạo tài khoản thành công!'; this.msgOk = true; this.showForm = false; this.load(); },
                error: err => { this.msg = err.error?.message || 'Tạo lỗi.'; this.msgOk = false; }
            });
        }
    }


  onDelete(id: number): void {
    if (!confirm('Xac nhan xoa?')) return;
    this.svc.delete(id).subscribe({
      next: () => { this.msg = 'Da xoa.'; this.msgOk = true; this.load(); },
      error: err => { this.msg = err.error?.message || 'Xoa that bai.'; this.msgOk = false; }
    });
  }
}
