import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
      <div class="container">
        <a class="navbar-brand fw-bold" routerLink="/">
          <i class="bi bi-globe-americas me-2"></i>TravelTour
        </a>
        <button class="navbar-toggler" type="button"
                data-bs-toggle="collapse" data-bs-target="#mainNav">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="mainNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <a class="nav-link" routerLink="/tours" routerLinkActive="active">
                <i class="bi bi-map me-1"></i>Tours
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/tours/search" routerLinkActive="active">
                <i class="bi bi-search me-1"></i>Tim kiem
              </a>
            </li>
            @if (auth.isAuthenticated() && auth.userRole() === 'Customer') {
              <li class="nav-item">
                <a class="nav-link" routerLink="/bookings" routerLinkActive="active">
                  <i class="bi bi-journal-text me-1"></i>Booking
                </a>
              </li>
            }
            @if (auth.isAuthenticated() && auth.userRole() === 'Admin') {
              <li class="nav-item">
                <a class="nav-link" routerLink="/admin/dashboard" routerLinkActive="active">
                  <i class="bi bi-speedometer2 me-1"></i>Admin
                </a>
              </li>
            }
          </ul>

          <ul class="navbar-nav">
            @if (auth.isAuthenticated()) {
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" role="button"
                   data-bs-toggle="dropdown">
                  <i class="bi bi-person-circle me-1"></i>
                  {{ auth.user()?.email }}
                  <span class="badge bg-info ms-1">{{ auth.userRole() }}</span>
                </a>
                <ul class="dropdown-menu dropdown-menu-end">
                  @if (auth.userRole() === 'Customer') {
                    <li><a class="dropdown-item" routerLink="/profile">
                      <i class="bi bi-person me-2"></i>Ho so
                    </a></li>
                    <li><a class="dropdown-item" routerLink="/change-password">
                      <i class="bi bi-shield-lock me-2"></i>Đổi mật khẩu
                    </a></li>
                    <li><hr class="dropdown-divider"></li>
                  } @else {
                    <li><a class="dropdown-item" routerLink="/admin/change-password">
                      <i class="bi bi-shield-lock me-2"></i>Đổi mật khẩu
                    </a></li>
                    <li><hr class="dropdown-divider"></li>
                  }
                  <li>
                    <a class="dropdown-item text-danger" (click)="auth.logout()" role="button">
                      <i class="bi bi-box-arrow-right me-2"></i>Dang xuat
                    </a>
                  </li>
                </ul>
              </li>
            } @else {
              <li class="nav-item">
                <a class="nav-link" routerLink="/login" routerLinkActive="active">
                  <i class="bi bi-box-arrow-in-right me-1"></i>Dang nhap
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/register" routerLinkActive="active">
                  <i class="bi bi-person-plus me-1"></i>Dang ky
                </a>
              </li>
            }
          </ul>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  constructor(public auth: AuthService) {}
}
