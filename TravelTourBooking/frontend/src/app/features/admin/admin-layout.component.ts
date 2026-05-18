import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-admin-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
    template: `
    <div class="d-flex">
      <nav class="sidebar d-flex flex-column flex-shrink-0" style="width:250px">
        <div class="p-3 border-bottom border-secondary">
          <h5 class="mb-0">
            @if (isAdmin) {
              <i class="bi bi-speedometer2 me-2"></i>Admin Panel
            } @else {
              <i class="bi bi-person-workspace me-2"></i>Staff Panel
            }
          </h5>
        </div>
        <ul class="nav flex-column p-2 flex-grow-1">

          <!-- DASHBOARD: chỉ Admin -->
          @if (isAdmin) {
            <li class="nav-item">
              <a class="nav-link" routerLink="dashboard" routerLinkActive="active">
                <i class="bi bi-bar-chart-line me-2"></i>Dashboard
              </a>
            </li>
          }

          <!-- TOUR: Admin = quản lý CRUD, Staff = chỉ xem -->
          <li class="nav-item">
            <a class="nav-link" routerLink="tours" routerLinkActive="active">
              <i class="bi bi-map me-2"></i>
              {{ isAdmin ? 'Quản lý Tour' : 'Danh sách Tour' }}
            </a>
          </li>

          <!-- BOOKING: cả Admin và Staff -->
          <li class="nav-item">
            <a class="nav-link" routerLink="bookings" routerLinkActive="active">
              <i class="bi bi-card-list me-2"></i>Danh sách Booking
            </a>
          </li>

          <!-- KHÁCH HÀNG: cả Admin và Staff (để tư vấn) -->
          <li class="nav-item">
            <a class="nav-link" routerLink="customers" routerLinkActive="active">
              <i class="bi bi-people me-2"></i>Khách hàng
            </a>
          </li>

          <!-- CÁC MENU DƯỚI ĐÂY CHỈ ADMIN MỚI THẤY -->
          @if (isAdmin) {
            <li class="nav-item">
              <a class="nav-link" routerLink="categories" routerLinkActive="active"><i class="bi bi-tags me-2"></i>Danh mục</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="destinations" routerLinkActive="active"><i class="bi bi-geo-alt me-2"></i>Điểm đến</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="schedules" routerLinkActive="active"><i class="bi bi-calendar-event me-2"></i>Lịch khởi hành</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="employees" routerLinkActive="active"><i class="bi bi-person-badge me-2"></i>Nhân viên</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="reports" routerLinkActive="active"><i class="bi bi-file-earmark-bar-graph me-2"></i>Báo cáo</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="vouchers" routerLinkActive="active"><i class="bi bi-ticket-perforated me-2"></i>Quản lý Voucher</a>
            </li>
          }
          <li class="nav-item mt-auto">
            <a class="nav-link" routerLink="change-password" routerLinkActive="active">
              <i class="bi bi-shield-lock me-2"></i>Đổi mật khẩu
            </a>
          </li>
        </ul>
      </nav>
      <div class="flex-grow-1 p-4 bg-light" style="min-height:calc(100vh - 56px)">
        <router-outlet />
      </div>
    </div>
  `
})
export class AdminLayoutComponent {
    private auth = inject(AuthService);
    isAdmin = this.auth.hasRole('Admin');
}
