import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { EmployeeService } from '../../../services/employee.service';
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
      <div class="alert" [class.alert-success]="msgOk" [class.alert-danger]="!msgOk">{{ msg }}</div>
    }

    @if (showForm) {
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body">
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="row g-3 align-items-end">
            <div class="col-md-3">
              <label class="form-label">Ho ten *</label>
              <input type="text" class="form-control" formControlName="fullName">
            </div>
            <div class="col-md-2">
              <label class="form-label">Vai tro</label>
              <input type="text" class="form-control" formControlName="role" placeholder="HDV / Admin">
            </div>
            <div class="col-md-2">
              <label class="form-label">SDT</label>
              <input type="text" class="form-control" formControlName="phone">
            </div>
            <div class="col-md-3">
              <label class="form-label">Email</label>
              <input type="email" class="form-control" formControlName="email">
            </div>
            <div class="col-md-2">
              <button type="submit" class="btn btn-primary me-1" [disabled]="form.invalid">
                {{ editId ? 'Luu' : 'Them' }}
              </button>
              <button type="button" class="btn btn-secondary" (click)="showForm=false">Huy</button>
            </div>
          </form>
        </div>
      </div>
    }

    <div class="table-responsive">
      <table class="table table-hover align-middle">
        <thead class="table-light">
          <tr><th>ID</th><th>Ho ten</th><th>Vai tro</th><th>SDT</th><th>Email</th><th></th></tr>
        </thead>
        <tbody>
          @for (e of items; track e.employeeId) {
            <tr>
              <td>{{ e.employeeId }}</td>
              <td>{{ e.fullName }}</td>
              <td>{{ e.role }}</td>
              <td>{{ e.phone }}</td>
              <td>{{ e.email }}</td>
              <td>
                <button class="btn btn-sm btn-outline-primary me-1" (click)="onEdit(e)">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" (click)="onDelete(e.employeeId)">
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
  showForm = false;
  editId: number | null = null;
  msg = '';
  msgOk = false;

  form = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    role: [''],
    phone: [''],
    email: ['']
  });

  constructor(private fb: FormBuilder, private svc: EmployeeService) {}

  ngOnInit(): void { this.load(); }
  load(): void { this.svc.getAll().subscribe(d => this.items = d); }

  openForm(): void {
    this.showForm = true; this.editId = null;
    this.form.reset({ fullName: '', role: '', phone: '', email: '' });
  }

  onEdit(e: EmployeeDto): void {
    this.showForm = true; this.editId = e.employeeId;
    this.form.patchValue({ fullName: e.fullName || '', role: e.role || '', phone: e.phone || '', email: e.email || '' });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const val = this.form.getRawValue();
    const dto: EmployeeDto = { employeeId: this.editId || 0, ...val };
    const obs = this.editId ? this.svc.update(this.editId, dto) : this.svc.create(dto);
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
