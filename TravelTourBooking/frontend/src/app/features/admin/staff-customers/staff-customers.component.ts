import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../../services/account.service';
import { CustomerList } from '../../../shared/models';

@Component({
  selector: 'app-staff-customers',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3 class="mb-0"><i class="bi bi-people me-2"></i>Danh sách Khách hàng</h3>
      <span class="badge bg-secondary fs-6">{{ customers.length }} khách hàng</span>
    </div>

    @if (loading) {
      <div class="spinner-overlay">
        <div class="spinner-border text-primary"></div>
      </div>
    } @else if (customers.length === 0) {
      <div class="empty-state text-center py-5">
        <i class="bi bi-people" style="font-size: 3rem; color: #ccc;"></i>
        <p class="mt-3 text-muted">Chưa có khách hàng nào trong hệ thống.</p>
      </div>
    } @else {
      <div class="card border-0 shadow-sm">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Họ tên</th>
                <th>Số điện thoại</th>
                <th>Ngày sinh</th>
                <th>Địa chỉ</th>
                <th>Ngày đăng ký</th>
              </tr>
            </thead>
            <tbody>
              @for (c of customers; track c.accountId) {
                <tr>
                  <td><span class="badge bg-light text-dark border">{{ c.accountId }}</span></td>
                  <td>
                    <div class="d-flex align-items-center gap-2">
                      <div class="avatar-sm bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                           style="width:32px; height:32px; font-size:13px; flex-shrink:0;">
                        {{ (c.fullName || c.email || '?')[0].toUpperCase() }}
                      </div>
                      <span>{{ c.email }}</span>
                    </div>
                  </td>
                  <td class="fw-semibold">{{ c.fullName || '—' }}</td>
                  <td>
                    @if (c.phone) {
                      <a href="tel:{{ c.phone }}" class="text-decoration-none">
                        <i class="bi bi-telephone me-1 text-success"></i>{{ c.phone }}
                      </a>
                    } @else {
                      <span class="text-muted">—</span>
                    }
                  </td>
                  <td>{{ c.dateOfBirth ? (c.dateOfBirth | date:'dd/MM/yyyy') : '—' }}</td>
                  <td>
                    <span class="text-truncate d-inline-block" style="max-width:160px;" [title]="c.address || ''">
                      {{ c.address || '—' }}
                    </span>
                  </td>
                  <td class="text-muted small">{{ c.createdAt | date:'dd/MM/yyyy' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    }
  `
})
export class StaffCustomersComponent implements OnInit {
  customers: CustomerList[] = [];
  loading = true;

  constructor(private accountSvc: AccountService) {}

  ngOnInit(): void {
    this.accountSvc.getAllCustomers().subscribe({
      next: data => { this.customers = data; this.loading = false; },
      error: () => this.loading = false
    });
  }
}
