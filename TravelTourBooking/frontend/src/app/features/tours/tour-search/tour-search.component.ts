import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TourService } from '../../../services/tour.service';
import { SearchTourResult } from '../../../shared/models';
import { getTourDisplayImageUrl, handleTourImageError } from '../../../shared/utils/tour-image.util';

@Component({
  selector: 'app-tour-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page-banner">
      <div class="container">
        <h1>Tìm kiếm Tour</h1>
        <p class="lead mb-0">Tìm tour du lịch phù hợp nhất với bạn</p>
      </div>
    </div>

    <div class="container py-4">
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body">
          <form [formGroup]="form" (ngSubmit)="onSearch()" class="row g-3 align-items-end">
            <div class="col-md-3">
              <label class="form-label">Điểm đến</label>
              <input type="text" class="form-control" formControlName="destination"
                     placeholder="VD: Đà Nẵng, Tokyo...">
            </div>
            <div class="col-md-2">
              <label class="form-label">Giá từ (VND)</label>
              <input type="number" class="form-control" formControlName="priceMin" placeholder="0">
            </div>
            <div class="col-md-2">
              <label class="form-label">Giá đến (VND)</label>
              <input type="number" class="form-control" formControlName="priceMax">
            </div>
            <div class="col-md-3">
              <label class="form-label">Ngày khởi hành</label>
              <input type="date" class="form-control" formControlName="date">
            </div>
            <div class="col-md-2">
              <button type="submit" class="btn btn-primary w-100" [disabled]="loading">
                @if (loading) {
                  <span class="spinner-border spinner-border-sm me-1"></span>
                }
                <i class="bi bi-search me-1"></i>Tìm
              </button>
            </div>
          </form>
        </div>
      </div>

      @if (searched && results.length === 0) {
        <div class="empty-state">
          <i class="bi bi-emoji-frown"></i>
          <p>Không tìm thấy tour phù hợp. Hãy thử thay đổi bộ lọc.</p>
        </div>
      }

      @if (results.length > 0) {
        <div class="row g-3">
          @for (tour of results; track tour.tourId) {
            <div class="col-md-4">
              <div class="card card-tour h-100">
                <div class="card-img-wrapper">
                  <img [src]="getImageUrl(tour.imageUrl, tour.desName, tour.cateName, tour.tourName)" class="card-img-top"
                       [alt]="tour.tourName" referrerpolicy="no-referrer"
                       (error)="handleImageError($event, tour.desName, tour.cateName, tour.tourName)">
                  <span class="tour-duration-badge">
                    <i class="bi bi-clock me-1"></i>{{ tour.durationDays }} ngày
                  </span>
                </div>
                <div class="card-body d-flex flex-column">
                  <h6 class="card-title text-truncate">{{ tour.tourName }}</h6>
                  <p class="text-muted small mb-1">
                    <i class="bi bi-geo-alt me-1"></i>{{ tour.desName }}
                    @if (tour.cateName) {
                      <span class="mx-1">|</span>
                      <i class="bi bi-tag me-1"></i>{{ tour.cateName }}
                    }
                  </p>
                  @if (tour.departureDate) {
                    <p class="small mb-2">
                      <i class="bi bi-calendar3 me-1 text-primary"></i>{{ tour.departureDate }}
                      <span class="mx-1">|</span>
                      <i class="bi bi-people me-1"></i>{{ tour.availableSlots }} chỗ
                    </p>
                  }
                  <div class="mt-auto d-flex justify-content-between align-items-center pt-2 border-top">
                    <div>
                      <span class="tour-price">{{ tour.price | number:'1.0-0' }}đ</span>
                      <small class="text-muted d-block">/ người</small>
                    </div>
                    <a [routerLink]="['/tours', tour.tourId]"
                       class="btn btn-sm btn-primary rounded-pill px-3">
                      <i class="bi bi-arrow-right me-1"></i>Chi tiết
                    </a>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class TourSearchComponent {
  form = this.fb.group({
    destination: [''],
    priceMin: [null as number | null],
    priceMax: [null as number | null],
    date: ['']
  });
  results: SearchTourResult[] = [];
  loading = false;
  searched = false;

  constructor(private fb: FormBuilder, private tourSvc: TourService) {}

  getImageUrl(imageUrl: string | null, desName?: string | null, cateName?: string | null, tourName?: string | null): string {
    return getTourDisplayImageUrl(imageUrl, desName, cateName, tourName);
  }

  handleImageError(event: Event, desName?: string | null, cateName?: string | null, tourName?: string | null): void {
    handleTourImageError(event, desName, cateName, tourName);
  }

  onSearch(): void {
    this.loading = true;
    const v = this.form.value;
    this.tourSvc.search(
      v.destination || undefined,
      v.priceMin ?? undefined,
      v.priceMax ?? undefined,
      v.date || undefined
    ).subscribe({
      next: data => {
        this.results = data;
        this.loading = false;
        this.searched = true;
      },
      error: () => {
        this.results = [];
        this.loading = false;
        this.searched = true;
      }
    });
  }
}
