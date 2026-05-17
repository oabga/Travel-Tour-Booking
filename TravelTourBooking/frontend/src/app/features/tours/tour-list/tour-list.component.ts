import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TourService } from '../../../services/tour.service';
import { CategoryService } from '../../../services/category.service';
import { DestinationService } from '../../../services/destination.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { TourList, PaginationMeta, CategoryResponse, DestinationResponse, PopularTourResult } from '../../../shared/models';
import { environment } from '../../../../environments/environment';
import { formatDurationLabel } from '../../../shared/utils/tour-duration.util';

@Component({
    selector: 'app-tour-list',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule, PaginationComponent],
    template: `
    <!-- Hero Banner -->
    <section class="hero-section hero-section-travel">
      <div class="container">
        <h1 class="display-4 fw-bold mb-3">Khám phá Việt Nam & Thế giới</h1>
        <p class="lead mb-2 opacity-75">Tìm và đặt tour du lịch tuyệt vời nhất cho bạn</p>

        <div class="hero-search">
          <div class="input-group input-group-lg bg-white rounded shadow">
            <span class="input-group-text bg-white border-0"><i class="bi bi-geo-alt text-primary"></i></span>
            <input type="text" class="form-control border-0" placeholder="Bạn muốn đi đâu?"
                   [(ngModel)]="searchDestination">
            <button class="btn btn-accent px-4 fw-semibold" (click)="goSearch()">
              <i class="bi bi-search me-1"></i>Tìm Tour
            </button>
          </div>
        </div>

        <div class="mt-4 d-flex flex-wrap justify-content-center gap-2">
          @for (c of categories; track c.cateId) {
            <span class="badge bg-white bg-opacity-25 text-white px-3 py-2 rounded-pill cursor-pointer"
                  (click)="filterCateId = c.cateId; loadTours()">
              {{ c.cateName }}
            </span>
          }
        </div>
      </div>
    </section>

    <!-- Popular Tours -->
    @if (popularTours.length) {
      <section class="container py-5">
        <div class="text-center mb-4">
          <h2 class="section-title"><i class="bi bi-fire text-danger me-2"></i>Tour nổi bật</h2>
          <p class="section-subtitle">Được khách đặt nhiều nhất tháng này</p>
        </div>
        <div class="row g-4">
          @for (t of popularTours; track t.tourId) {
            <div class="col-lg-3 col-md-6">
              <a [routerLink]="['/tours', t.tourId]" class="text-decoration-none">
                <div class="card card-tour h-100">
                  <div class="card-img-wrapper">
                    @if (t.imageUrl) {
                      <img [src]="environment.imageBaseUrl + t.imageUrl"
                           class="card-img-top" (error)="handleImageError($event)">
                    } @else {
                      <div class="img-placeholder"><i class="bi bi-image"></i></div>
                    }
                    <span class="tour-duration-badge"><i class="bi bi-clock me-1"></i>Hot</span>
                  </div>
                  <div class="card-body">
                    <h6 class="card-title text-dark text-truncate">{{ t.tourName }}</h6>
                    <p class="text-muted small mb-2">
                      <i class="bi bi-geo-alt me-1"></i>{{ t.desName }}
                    </p>
                    <div class="d-flex justify-content-between align-items-center">
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

    <!-- All Tours Section -->
    <section class="bg-white py-5">
      <div class="container">
        <div class="text-center mb-4">
          <h2 class="section-title">Danh sách Tour</h2>
          <p class="section-subtitle">Chọn tour phù hợp với bạn</p>
        </div>

        <div class="row">
          <div class="col-lg-3 mb-4">
            <div class="card border-0 shadow-sm">
              <div class="card-body">
                <h6 class="fw-bold mb-3"><i class="bi bi-funnel me-2"></i>Bộ lọc</h6>
                <div class="mb-3">
                  <label class="form-label fw-semibold small">Danh mục</label>
                  <select class="form-select form-select-sm" [(ngModel)]="filterCateId" (change)="onFilterChange()">
                    <option [ngValue]="undefined">Tất cả danh mục</option>
                    @for (c of categories; track c.cateId) {
                      <option [ngValue]="c.cateId">{{ c.cateName }}</option>
                    }
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-semibold small">Điểm đến</label>
                  <select class="form-select form-select-sm" [(ngModel)]="filterDesId" (change)="onFilterChange()">
                    <option [ngValue]="undefined">Tất cả điểm đến</option>
                    @for (d of destinations; track d.desId) {
                      <option [ngValue]="d.desId">{{ d.desName }}</option>
                    }
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-semibold small">Thời lượng</label>
                  <select class="form-select form-select-sm" [(ngModel)]="filterDurationDays" (change)="onFilterChange()">
                    <option [ngValue]="undefined">Tất cả</option>
                    @for (d of durationOptions; track d) {
                      <option [ngValue]="d">{{ formatDurationLabel(d) }}</option>
                    }
                  </select>
                </div>
                <button class="btn btn-outline-secondary btn-sm w-100" (click)="resetFilter()">
                  <i class="bi bi-x-circle me-1"></i>Xóa bộ lọc
                </button>
              </div>
            </div>
          </div>

          <div class="col-lg-9">
            @if (loading) {
              <div class="text-center py-5"><div class="spinner-border text-primary"></div></div>
            } @else if (tours.length === 0) {
              <div class="empty-state">
                <i class="bi bi-search"></i>
                <p>Không tìm thấy tour nào phù hợp.</p>
              </div>
            } @else {
              <div class="row g-4">
                @for (tour of tours; track tour.tourId) {
                  <div class="col-md-6 col-lg-4">
                    <div class="card card-tour h-100">
                      <div class="card-img-wrapper">
                        <img [src]="tour.imageUrl ? environment.imageBaseUrl + tour.imageUrl : '/assets/images/default-tour.svg'"
                             class="card-img-top" (error)="handleImageError($event)" [alt]="tour.tourName">
                        <span class="tour-duration-badge">
                          <i class="bi bi-clock me-1"></i>{{ tour.durationDays }} ngày
                        </span>
                      </div>
                      <div class="card-body d-flex flex-column">
                        <h6 class="card-title text-truncate">{{ tour.tourName }}</h6>
                        <p class="text-muted small mb-2">
                          <i class="bi bi-geo-alt me-1"></i>{{ tour.desName }}
                          @if (tour.cateName) {
                            <span class="mx-1">|</span>
                            <i class="bi bi-tag me-1"></i>{{ tour.cateName }}
                          }
                        </p>
                        @if (tour.avgRating) {
                          <div class="mb-2">
                            <span class="text-warning small">
                              @for (s of [1,2,3,4,5]; track s) {
                                <i class="bi" [class.bi-star-fill]="s <= tour.avgRating!" [class.bi-star]="s > tour.avgRating!"></i>
                              }
                            </span>
                            <small class="text-muted ms-1">{{ tour.avgRating | number:'1.1-1' }}</small>
                          </div>
                        }
                        <div class="mt-auto d-flex justify-content-between align-items-center pt-2 border-top">
                          <div>
                            <span class="tour-price">{{ tour.price | number:'1.0-0' }}đ</span>
                            <small class="text-muted d-block">/ người</small>
                          </div>
                          <a [routerLink]="['/tours', tour.tourId]" class="btn btn-sm btn-primary rounded-pill px-3">
                            <i class="bi bi-arrow-right me-1"></i>Đặt ngay
                          </a>
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
      </div>
    </section>

    <!-- Why Choose Us -->
    <section class="container py-5">
      <div class="text-center mb-5">
        <h2 class="section-title">Vì sao chọn TravelTour?</h2>
        <p class="section-subtitle">Những cam kết của chúng tôi dành cho bạn</p>
      </div>
      <div class="row g-4">
        <div class="col-md-3 col-6">
          <div class="feature-card bg-white shadow-sm">
            <div class="feature-icon bg-primary bg-opacity-10">
              <i class="bi bi-shield-check text-primary"></i>
            </div>
            <h6 class="fw-bold">Uy tín hàng đầu</h6>
            <p class="text-muted small mb-0">Cam kết chất lượng dịch vụ tốt nhất</p>
          </div>
        </div>
        <div class="col-md-3 col-6">
          <div class="feature-card bg-white shadow-sm">
            <div class="feature-icon bg-success bg-opacity-10">
              <i class="bi bi-wallet2 text-success"></i>
            </div>
            <h6 class="fw-bold">Giá tốt nhất</h6>
            <p class="text-muted small mb-0">Giá cả minh bạch, không phí ẩn</p>
          </div>
        </div>
        <div class="col-md-3 col-6">
          <div class="feature-card bg-white shadow-sm">
            <div class="feature-icon bg-warning bg-opacity-10">
              <i class="bi bi-headset text-warning"></i>
            </div>
            <h6 class="fw-bold">Hỗ trợ 24/7</h6>
            <p class="text-muted small mb-0">Luôn sẵn sàng hỗ trợ mọi lúc</p>
          </div>
        </div>
        <div class="col-md-3 col-6">
          <div class="feature-card bg-white shadow-sm">
            <div class="feature-icon bg-info bg-opacity-10">
              <i class="bi bi-globe text-info"></i>
            </div>
            <h6 class="fw-bold">Nhiều lựa chọn</h6>
            <p class="text-muted small mb-0">50+ tour trong và ngoài nước</p>
          </div>
        </div>
      </div>
    </section>
  `
})
export class TourListComponent implements OnInit {
    readonly formatDurationLabel = formatDurationLabel;
    tours: TourList[] = [];
    popularTours: PopularTourResult[] = [];
    readonly environment = environment;
    categories: CategoryResponse[] = [];
    destinations: DestinationResponse[] = [];
    durationOptions: number[] = [];
    pagination: PaginationMeta = { page: 1, pageSize: 9, totalCount: 0, totalPages: 0, hasPrev: false, hasNext: false };
    loading = false;
    searchDestination = '';

    filterCateId?: number;
    filterDesId?: number;
    filterDurationDays?: number;

    constructor(
        private tourSvc: TourService,
        private cateSvc: CategoryService,
        private desSvc: DestinationService,
        private router: Router,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        this.cateSvc.getAll().subscribe(d => this.categories = d);
        this.desSvc.getAll().subscribe(d => this.destinations = d);
        this.tourSvc.getDurationOptions().subscribe(d => this.durationOptions = d);
        this.tourSvc.getPopular().subscribe(d => this.popularTours = d.slice(0, 4));

        this.route.queryParams.subscribe(params => {
            this.filterCateId = params['cateId'] ? +params['cateId'] : undefined;
            this.filterDurationDays = params['durationDays'] ? +params['durationDays'] : undefined;
            this.pagination.page = 1;
            this.loadTours();
        });
    }

    onFilterChange(): void {
        this.pagination.page = 1;
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
                cateId: this.filterCateId ?? null,
                durationDays: this.filterDurationDays ?? null
            },
            queryParamsHandling: 'merge'
        });
    }

    handleImageError(event: any): void {
        event.target.src = '/assets/images/default-tour.svg';
    }

    goSearch(): void {
        this.router.navigate(['/tours/search'], {
            queryParams: this.searchDestination ? { destination: this.searchDestination } : {}
        });
    }

    loadTours(): void {
        this.loading = true;
        this.tourSvc.getAll(
            this.pagination.page,
            this.pagination.pageSize,
            this.filterCateId,
            this.filterDesId,
            this.filterDurationDays
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
        this.filterDurationDays = undefined;
        this.pagination.page = 1;
        this.router.navigate([], { relativeTo: this.route, queryParams: {} });
    }
}
