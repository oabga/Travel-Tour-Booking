import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="d-flex">
      <!-- Sidebar -->
      <nav class="sidebar d-flex flex-column flex-shrink-0" style="width:250px">
        <div class="p-3 border-bottom border-secondary">
          <h5 class="mb-0"><i class="bi bi-speedometer2 me-2"></i>Admin Panel</h5>
        </div>
        <ul class="nav flex-column p-2 flex-grow-1">
          <li class="nav-item">
            <a class="nav-link" routerLink="dashboard" routerLinkActive="active">
              <i class="bi bi-bar-chart-line me-2"></i>Dashboard
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="tours" routerLinkActive="active">
              <i class="bi bi-map me-2"></i>Quan ly Tour
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="categories" routerLinkActive="active">
              <i class="bi bi-tags me-2"></i>Danh muc
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="destinations" routerLinkActive="active">
              <i class="bi bi-geo-alt me-2"></i>Diem den
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="schedules" routerLinkActive="active">
              <i class="bi bi-calendar-event me-2"></i>Lich khoi hanh
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="employees" routerLinkActive="active">
              <i class="bi bi-person-badge me-2"></i>Nhan vien
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="reports" routerLinkActive="active">
              <i class="bi bi-file-earmark-bar-graph me-2"></i>Bao cao
            </a>
          </li>
        </ul>
      </nav>

      <!-- Main content -->
      <div class="flex-grow-1 p-4 bg-light" style="min-height:calc(100vh - 56px)">
        <router-outlet />
      </div>
    </div>
  `
})
export class AdminLayoutComponent {}
