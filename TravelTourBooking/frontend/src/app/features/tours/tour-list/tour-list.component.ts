import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TourService } from '../../../services/tour.service';
import { CategoryService } from '../../../services/category.service';
import { DestinationService } from '../../../services/destination.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { TourList, PaginationMeta, CategoryResponse, DestinationResponse, PopularTourResult } from '../../../shared/models';

@Component({
  selector: 'app-tour-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PaginationComponent],
  template: `
    <!-- Hero -->
    <section class="hero-section">
      <div class="container">
        <h1 class="display-4 fw-bold mb-3">Kham pha Viet Nam & The gioi</h1>
        <p class="lead mb-0">Tim va dat tour du lich tuyet voi nhat cho ban</p>
      </div>
    </section>

    <!-- Popular Tours -->
    @if (popularTours.length) {
      <section class="container py-4">
        <h4 class="mb-3"><i class="bi bi-fire text-danger me-2"></i>Tour pho bien</h4>
        <div class="row g-3">
          @for (t of popularTours; track t.tourId) {
            <div class="col-md-3">
              <a [routerLink]="['/tours', t.tourId]" class="text-decoration-none">
                <div class="card card-tour h-100">
                  <div class="img-placeholder"><i class="bi bi-image"></i></div>
                  <div class="card-body">
                    <h6 class="card-title text-dark">{{ t.tourName }}</h6>
                    <small class="text-muted">{{ t.desName }}</small>
                    <div class="mt-2">
                      <span class="text-warning">
                        @for (s of [1,2,3,4,5]; track s) {
                          <i class="bi" [class.bi-star-fill]="s <= t.avgRating"
                             [class.bi-star]="s > t.avgRating"></i>
                        }
                      </span>
                      <small class="text-muted ms-1">{{ t.totalBookings }} luot dat</small>
                    </div>
                  </div>
                </div>
              </a>
            </div>
          }
        </div>
      </section>
    }

    <!-- Filters + Tour List -->
    <section class="container py-4">
      <div class="row">
        <!-- Filters Sidebar -->
        <div class="col-md-3">
          <div class="card border-0 shadow-sm mb-3">
            <div class="card-body">
              <h5 class="card-title mb-3"><i class="bi bi-funnel me-2"></i>Bo loc</h5>

              <div class="mb-3">
                <label class="form-label fw-semibold">Danh muc</label>
                <select class="form-select" [(ngModel)]="filterCateId" (change)="loadTours()">
                  <option [ngValue]="undefined">Tat ca</option>
                  @for (c of categories; track c.cateId) {
                    <option [ngValue]="c.cateId">{{ c.cateName }}</option>
                  }
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">Diem den</label>
                <select class="form-select" [(ngModel)]="filterDesId" (change)="loadTours()">
                  <option [ngValue]="undefined">Tat ca</option>
                  @for (d of destinations; track d.desId) {
                    <option [ngValue]="d.desId">{{ d.desName }}</option>
                  }
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">Gia tu (VND)</label>
                <input type="number" class="form-control" [(ngModel)]="filterPriceMin"
                       placeholder="0" (change)="loadTours()">
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">Gia den (VND)</label>
                <input type="number" class="form-control" [(ngModel)]="filterPriceMax"
                       placeholder="999,999,999" (change)="loadTours()">
              </div>

              <button class="btn btn-outline-secondary btn-sm w-100" (click)="resetFilter()">
                <i class="bi bi-x-circle me-1"></i>Xoa bo loc
              </button>
            </div>
          </div>
        </div>

        <!-- Tours Grid -->
        <div class="col-md-9">
          @if (loading) {
            <div class="spinner-overlay">
              <div class="spinner-border text-primary" role="status"></div>
            </div>
          } @else if (tours.length === 0) {
            <div class="empty-state">
              <i class="bi bi-search"></i>
              <p>Khong tim thay tour nao. Hay thu doi bo loc.</p>
            </div>
          } @else {
            <div class="row g-3">
              @for (tour of tours; track tour.tourId) {
                <div class="col-md-4">
                  <div class="card card-tour h-100">
                    @if (tour.imageUrl) {
                      <img [src]="tour.imageUrl" class="card-img-top" [alt]="tour.tourName">
                    } @else {
                      <div class="img-placeholder"><i class="bi bi-image"></i></div>
                    }
                    <div class="card-body d-flex flex-column">
                      <h6 class="card-title">{{ tour.tourName }}</h6>
                      <p class="text-muted small mb-1">
                        <i class="bi bi-geo-alt me-1"></i>{{ tour.desName }}
                        <span class="mx-1">|</span>
                        <i class="bi bi-tag me-1"></i>{{ tour.cateName }}
                      </p>
                      <p class="small mb-2">
                        <i class="bi bi-clock me-1"></i>{{ tour.durationDays }} ngay
                        <span class="mx-1">|</span>
                        <i class="bi bi-people me-1"></i>{{ tour.maxCapacity }} cho
                      </p>
                      @if (tour.avgRating) {
                        <div class="mb-2">
                          <span class="text-warning">
                            @for (s of [1,2,3,4,5]; track s) {
                              <i class="bi" [class.bi-star-fill]="s <= (tour.avgRating)"
                                 [class.bi-star]="s > (tour.avgRating)"></i>
                            }
                          </span>
                          <small class="text-muted ms-1">{{ tour.avgRating | number:'1.1-1' }}</small>
                        </div>
                      }
                      <div class="mt-auto d-flex justify-content-between align-items-center">
                        <span class="fw-bold text-primary fs-6">
                          {{ tour.price | number:'1.0-0' }} VND
                        </span>
                        <a [routerLink]="['/tours', tour.tourId]"
                           class="btn btn-sm btn-outline-primary">
                          Chi tiet <i class="bi bi-arrow-right"></i>
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
    </section>
  `
})
export class TourListComponent implements OnInit {
  tours: TourList[] = [];
  popularTours: PopularTourResult[] = [];
  categories: CategoryResponse[] = [];
  destinations: DestinationResponse[] = [];
  pagination: PaginationMeta = { page: 1, pageSize: 9, totalCount: 0, totalPages: 0, hasPrev: false, hasNext: false };
  loading = false;

  filterCateId?: number;
  filterDesId?: number;
  filterPriceMin?: number;
  filterPriceMax?: number;

  constructor(
    private tourSvc: TourService,
    private cateSvc: CategoryService,
    private desSvc: DestinationService
  ) {}

  ngOnInit(): void {
    this.cateSvc.getAll().subscribe(d => this.categories = d);
    this.desSvc.getAll().subscribe(d => this.destinations = d);
    this.tourSvc.getPopular().subscribe(d => this.popularTours = d.slice(0, 4));
    this.loadTours();
  }

  loadTours(): void {
    this.loading = true;
    this.tourSvc.getAll(
      this.pagination.page, this.pagination.pageSize,
      this.filterCateId, this.filterDesId,
      this.filterPriceMin, this.filterPriceMax
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
    this.pagination = { ...this.pagination, page };
    this.loadTours();
  }

  resetFilter(): void {
    this.filterCateId = undefined;
    this.filterDesId = undefined;
    this.filterPriceMin = undefined;
    this.filterPriceMax = undefined;
    this.pagination = { ...this.pagination, page: 1 };
    this.loadTours();
  }
}
