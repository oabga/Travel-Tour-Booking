import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CategoryService } from '../../../services/category.service';
import { TourService } from '../../../services/tour.service';
import { CategoryResponse } from '../../../shared/models';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar navbar-expand-lg navbar-light bg-white sticky-top shadow-sm">
      <div class="container">
        <a class="navbar-brand fw-bold text-primary" routerLink="/">
          <i class="bi bi-globe-americas me-2 fs-4"></i>TravelTour
        </a>

        <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="mainNav">
          <ul class="navbar-nav mx-auto">
            <li class="nav-item dropdown dropdown-hover">
              <a class="nav-link dropdown-toggle fw-semibold" href="#" role="button"
                 data-bs-toggle="dropdown" data-bs-auto-close="outside">
                <i class="bi bi-map me-1"></i>Tour Du Lịch
              </a>
              <div class="dropdown-menu dropdown-menu-mega dropdown-menu-compact border-0 shadow-lg">
                <div class="mega-menu-panel">
                  <div class="mega-menu-col">
                    <h6 class="mega-menu-heading"><i class="bi bi-geo-alt me-2"></i>Danh mục tour</h6>
                    @if (categories.length === 0) {
                      <span class="text-muted small">Chưa có danh mục</span>
                    }
                    @for (cat of categories; track cat.cateId) {
                      <a class="dropdown-item rounded py-2"
                         routerLink="/tours"
                         [queryParams]="{ cateId: cat.cateId }">
                        {{ cat.cateName }}
                      </a>
                    }
                  </div>
                  <div class="mega-menu-col">
                    <h6 class="mega-menu-heading"><i class="bi bi-clock me-2"></i>Theo thời lượng</h6>
                    @for (d of durationOptions; track d) {
                      <a class="dropdown-item rounded py-2"
                         routerLink="/tours"
                         [queryParams]="{ durationDays: d }">
                        {{ d }}
                      </a>
                    }
                  </div>
                </div>
                <hr class="my-2">
                <a routerLink="/tours" class="btn btn-sm btn-outline-primary">
                  <i class="bi bi-grid me-1"></i>Xem tất cả tour
                </a>
              </div>
            </li>

            <li class="nav-item dropdown dropdown-hover">
              <a class="nav-link dropdown-toggle fw-semibold" href="#" role="button" data-bs-toggle="dropdown">
                <i class="bi bi-info-circle me-1"></i>Giới thiệu
              </a>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" routerLink="/about" routerLinkActive="active"><i class="bi bi-building me-2"></i>Về chúng tôi</a></li>
                <li><a class="dropdown-item" routerLink="/guide-booking"><i class="bi bi-journal-check me-2"></i>Hướng dẫn đặt tour</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" routerLink="/privacy"><i class="bi bi-shield-lock me-2"></i>Chính sách bảo mật</a></li>
                <li><a class="dropdown-item" routerLink="/terms"><i class="bi bi-file-text me-2"></i>Điều khoản chung</a></li>
                <li><a class="dropdown-item" routerLink="/faq"><i class="bi bi-question-circle me-2"></i>Câu hỏi thường gặp</a></li>
              </ul>
            </li>

            <li class="nav-item">
              <a class="nav-link fw-semibold" routerLink="/pricing" routerLinkActive="active">Bảng giá</a>
            </li>
            <li class="nav-item">
              <a class="nav-link fw-semibold" routerLink="/contact" routerLinkActive="active">Liên hệ</a>
            </li>
            <li class="nav-item ms-lg-2">
              <a class="nav-link btn btn-accent text-white px-3 py-1 rounded-pill fw-semibold" routerLink="/tours/search">
                <i class="bi bi-search me-1"></i>Đặt Tour
              </a>
            </li>
          </ul>

          <div class="d-flex align-items-center gap-3">
            <div class="d-none d-lg-flex align-items-center text-muted small">
              <i class="bi bi-telephone-fill text-primary me-1"></i>
              <span class="fw-semibold">1900 1234</span>
            </div>

            @if (auth.isAuthenticated()) {
              <div class="dropdown">
                <a class="btn btn-outline-secondary btn-sm dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                  <i class="bi bi-person-circle me-1"></i>{{ auth.user()?.email }}
                </a>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li class="px-3 py-1"><span class="badge bg-info">{{ auth.userRole() }}</span></li>
                  <li><hr class="dropdown-divider"></li>
                  @if (auth.userRole() === 'Customer') {
                    <li><a class="dropdown-item" routerLink="/profile"><i class="bi bi-person me-2"></i>Hồ sơ</a></li>
                    <li><a class="dropdown-item" routerLink="/bookings"><i class="bi bi-journal-text me-2"></i>Lịch sử đặt tour</a></li>
                    <li><a class="dropdown-item" routerLink="/change-password"><i class="bi bi-shield-lock me-2"></i>Đổi mật khẩu</a></li>
                  }
                  @if (auth.userRole() === 'Admin') {
                    <li><a class="dropdown-item" routerLink="/admin/dashboard"><i class="bi bi-speedometer2 me-2"></i>Quản trị</a></li>
                    <li><a class="dropdown-item" routerLink="/admin/change-password"><i class="bi bi-shield-lock me-2"></i>Đổi mật khẩu</a></li>
                  }
                  @if (auth.userRole() === 'Staff') {
                    <li><a class="dropdown-item" routerLink="/admin/bookings"><i class="bi bi-person-workspace me-2"></i>Staff Panel</a></li>
                    <li><a class="dropdown-item" routerLink="/admin/change-password"><i class="bi bi-shield-lock me-2"></i>Đổi mật khẩu</a></li>
                  }
                  <li><hr class="dropdown-divider"></li>
                  <li><a class="dropdown-item text-danger" (click)="auth.logout()" role="button"><i class="bi bi-box-arrow-right me-2"></i>Đăng xuất</a></li>
                </ul>
              </div>
            } @else {
              <a routerLink="/login" class="btn btn-outline-primary btn-sm">Đăng nhập</a>
              <a routerLink="/register" class="btn btn-primary btn-sm">Đăng ký</a>
            }
          </div>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent implements OnInit {
  categories: CategoryResponse[] = [];
  durationOptions: number[] = [];

  constructor(
    public auth: AuthService,
    private cateSvc: CategoryService,
    private tourSvc: TourService
  ) {}

  ngOnInit(): void {
    this.cateSvc.getAll().subscribe(d => this.categories = d);
    this.tourSvc.getDurationOptions().subscribe(d => this.durationOptions = d);
  }
}
