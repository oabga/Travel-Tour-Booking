import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TourService } from '../../../services/tour.service';
import { CategoryService } from '../../../services/category.service';
import { TourList, CategoryResponse } from '../../../shared/models';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-banner">
      <div class="container">
        <h1>Bảng giá Tour</h1>
        <p class="lead mb-0">Giá tour minh bạch — Không phát sinh chi phí ẩn</p>
      </div>
    </div>

    <div class="container py-5">
      @if (loading) {
        <div class="text-center py-5"><div class="spinner-border text-primary"></div></div>
      } @else {
        <ul class="nav nav-pills mb-4 justify-content-center">
          <li class="nav-item">
            <a class="nav-link" [class.active]="!selectedCateId" (click)="selectedCateId = undefined" role="button">
              Tất cả
            </a>
          </li>
          @for (cat of categories; track cat.cateId) {
            <li class="nav-item">
              <a class="nav-link" [class.active]="selectedCateId === cat.cateId"
                 (click)="selectedCateId = cat.cateId" role="button">
                {{ cat.cateName }}
              </a>
            </li>
          }
        </ul>

        <div class="table-responsive">
          <table class="table table-hover align-middle bg-white rounded shadow-sm">
            <thead class="table-light">
              <tr>
                <th>Tour</th>
                <th>Danh mục</th>
                <th>Thời lượng</th>
                <th>Sức chứa</th>
                <th class="text-end">Giá / người</th>
                <th class="text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              @for (tour of filteredTours; track tour.tourId) {
                <tr>
                  <td>
                    <div class="d-flex align-items-center">
                      <div>
                        <strong>{{ tour.tourName }}</strong>
                        <br><small class="text-muted"><i class="bi bi-geo-alt me-1"></i>{{ tour.desName }}</small>
                      </div>
                    </div>
                  </td>
                  <td><span class="badge bg-primary-subtle text-primary">{{ tour.cateName }}</span></td>
                  <td><i class="bi bi-clock me-1"></i>{{ tour.durationDays }} ngày</td>
                  <td><i class="bi bi-people me-1"></i>{{ tour.maxCapacity }} người</td>
                  <td class="text-end">
                    <span class="fw-bold text-danger fs-6">{{ tour.price | number:'1.0-0' }} VND</span>
                  </td>
                  <td class="text-center">
                    <a [routerLink]="['/tours', tour.tourId]" class="btn btn-sm btn-outline-primary">
                      <i class="bi bi-eye me-1"></i>Chi tiết
                    </a>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        @if (filteredTours.length === 0) {
          <div class="text-center py-4 text-muted">
            <i class="bi bi-inbox fs-1 d-block mb-2"></i>
            Không có tour nào trong danh mục này.
          </div>
        }
      }

      <div class="card border-0 shadow-sm mt-4">
        <div class="card-body">
          <h6 class="fw-bold"><i class="bi bi-info-circle me-2 text-primary"></i>Lưu ý</h6>
          <ul class="text-muted small mb-0">
            <li>Giá trên là giá tham khảo cho 1 người lớn, chưa bao gồm các dịch vụ phát sinh.</li>
            <li>Trẻ em dưới 5 tuổi miễn phí, từ 5-11 tuổi tính 70% giá người lớn.</li>
            <li>Giá có thể thay đổi theo mùa và dịp lễ. Liên hệ hotline 1900 1234 để được báo giá chính xác.</li>
          </ul>
        </div>
      </div>
    </div>
  `
})
export class PricingComponent implements OnInit {
  tours: TourList[] = [];
  categories: CategoryResponse[] = [];
  loading = true;
  selectedCateId?: number;

  get filteredTours(): TourList[] {
    if (!this.selectedCateId) return this.tours;
    return this.tours.filter(t => t.cateName === this.categories.find(c => c.cateId === this.selectedCateId)?.cateName);
  }

  constructor(private tourSvc: TourService, private cateSvc: CategoryService) {}

  ngOnInit(): void {
    this.cateSvc.getAll().subscribe(d => this.categories = d);
    this.tourSvc.getAll(1, 100).subscribe({
      next: res => { this.tours = res.items; this.loading = false; },
      error: () => this.loading = false
    });
  }
}
