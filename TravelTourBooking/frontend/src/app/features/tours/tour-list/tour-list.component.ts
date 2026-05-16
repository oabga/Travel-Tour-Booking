import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TourService } from '../../../services/tour.service';
import { CategoryService } from '../../../services/category.service';
import { DestinationService } from '../../../services/destination.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { TourList, PaginationMeta, CategoryResponse, DestinationResponse } from '../../../shared/models';

@Component({
    selector: 'app-tour-list',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule, PaginationComponent],
    template: `
    <section class="hero-section">
      <div class="container">
        <h1 class="display-4 fw-bold mb-3">Khám phá Việt Nam & Thế giới</h1>
        <p class="lead mb-0">Tìm và đặt tour du lịch tuyệt vời nhất cho bạn</p>
      </div>
    </section>

    @if (popularTours.length) {
      <section class="container py-4">
        <h4 class="mb-3"><i class="bi bi-fire text-danger me-2"></i>Tour phổ biến</h4>
        <div class="row g-3">
          @for (t of popularTours; track t.tourId) {
            <div class="col-md-3">
              <a [routerLink]="['/tours', t.tourId]" class="text-decoration-none">
                <div class="card card-tour h-100">
                  <div class="position-relative">
                    @if (t.imageUrl) {
                      <img [src]="'https://localhost:7008' + t.imageUrl" 
                           class="card-img-top" style="height: 160px; object-fit: cover;"
                           (error)="handleImageError($event)">
                    } @else {
                      <div class="img-placeholder"><i class="bi bi-image"></i></div>
                    }
                  </div>
                  <div class="card-body">
                    <h6 class="card-title text-dark mb-1 text-truncate">{{ t.tourName }}</h6>
                    <small class="text-muted"><i class="bi bi-geo-alt me-1"></i>{{ t.desName }}</small>
                    <div class="mt-2 d-flex justify-content-between align-items-center">
                      <span class="text-warning small">
                        @for (s of [1,2,3,4,5]; track s) {
                          <i class="bi" [class.bi-star-fill]="s <= t.avgRating" [class.bi-star]="s > t.avgRating"></i>
                        }
                      </span>
                      <small class="text-muted">{{ t.totalBookings }} lượt đặt</small>
                    </div>
                  </div>
                </div>
              </a>
            </div>
          }
        </div>
      </section>
    }

    <section class="container py-4">
      <div class="row">
        <div class="col-md-3">
          <div class="card border-0 shadow-sm mb-3">
            <div class="card-body">
              <h5 class="card-title mb-3"><i class="bi bi-funnel me-2"></i>Bộ lọc</h5>
              <div class="mb-3">
                <label class="form-label fw-semibold small">Danh mục</label>
                <select class="form-select form-select-sm" [(ngModel)]="filterCateId" (change)="loadTours()">
                  <option [ngValue]="undefined">Tất cả danh mục</option>
                  @for (c of categories; track c.cateId) {
                    <option [ngValue]="c.cateId">{{ c.cateName }}</option>
                  }
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold small">Điểm đến</label>
                <select class="form-select form-select-sm" [(ngModel)]="filterDesId" (change)="loadTours()">
                  <option [ngValue]="undefined">Tất cả điểm đến</option>
                  @for (d of destinations; track d.desId) {
                    <option [ngValue]="d.desId">{{ d.desName }}</option>
                  }
                </select>
              </div>
              <button class="btn btn-outline-secondary btn-sm w-100" (click)="resetFilter()">Xóa bộ lọc</button>
            </div>
          </div>
        </div>

        <div class="col-md-9">
          @if (loading) {
            <div class="text-center py-5"><div class="spinner-border text-primary"></div></div>
          } @else if (tours.length === 0) {
            <div class="text-center py-5 border rounded bg-white">
              <i class="bi bi-search display-1 text-muted"></i>
              <p class="mt-3">Không tìm thấy tour nào phù hợp.</p>
            </div>
          } @else {
            <div class="row g-3">
              @for (tour of tours; track tour.tourId) {
                <div class="col-md-4">
                  <div class="card card-tour h-100">
                    <img [src]="tour.imageUrl ? 'https://localhost:7008' + tour.imageUrl : 'assets/images/default-tour.jpg'"
                         class="card-img-top" style="height: 180px; object-fit: cover;"
                         (error)="handleImageError($event)">
                    <div class="card-body d-flex flex-column">
                      <h6 class="card-title text-truncate">{{ tour.tourName }}</h6>
                      <p class="text-muted small mb-2">
                        <i class="bi bi-geo-alt me-1"></i>{{ tour.desName }} | {{ tour.cateName }}
                      </p>
                      <div class="mt-auto d-flex justify-content-between align-items-center">
                        <span class="fw-bold text-primary">{{ tour.price | number:'1.0-0' }} đ</span>
                        <a [routerLink]="['/tours', tour.tourId]" class="btn btn-sm btn-primary">Chi tiết</a>
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>
            <div class="mt-4">
              <app-pagination [meta]="pagination" (pageChange)="onPageChange($event)" />
            </div>
          }
        </div>
      </div>
    </section>
  `
})
export class TourListComponent implements OnInit {
    tours: TourList[] = [];
    popularTours: any[] = []; // Đặt là any để truy cập t.imageUrl thoải mái
    categories: CategoryResponse[] = [];
    destinations: DestinationResponse[] = [];
    pagination: PaginationMeta = { page: 1, pageSize: 9, totalCount: 0, totalPages: 0, hasPrev: false, hasNext: false };
    loading = false;

    filterCateId?: number;
    filterDesId?: number;

    constructor(
        private tourSvc: TourService,
        private cateSvc: CategoryService,
        private desSvc: DestinationService
    ) { }

    ngOnInit(): void {
        this.cateSvc.getAll().subscribe(d => this.categories = d);
        this.desSvc.getAll().subscribe(d => this.destinations = d);
        this.tourSvc.getPopular().subscribe(d => this.popularTours = d.slice(0, 4));
        this.loadTours();
    }

    handleImageError(event: any): void {
        // Dùng any cho event để truy cập target.src mà không bị TypeScript chặn
        event.target.src = '/assets/images/default-tour.jpg';
    }

    loadTours(): void {
        this.loading = true;
        this.tourSvc.getAll(
            this.pagination.page,
            this.pagination.pageSize,
            this.filterCateId,
            this.filterDesId
        ).subscribe({
            next: res => {
                this.tours = res.items;
                this.pagination = res.pagination;
                this.loading = false;
            },
            error: () => this.loading = false
        });
    }

    onPageChange(page: number): void {
        this.pagination.page = page;
        this.loadTours();
    }

    resetFilter(): void {
        this.filterCateId = undefined;
        this.filterDesId = undefined;
        this.pagination.page = 1;
        this.loadTours();
    }
}