import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TourService } from '../../../services/tour.service';
import { SearchTourResult } from '../../../shared/models';

@Component({
  selector: 'app-tour-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container py-4">
      <h3 class="mb-4"><i class="bi bi-search me-2"></i>Tim kiem tour nang cao</h3>

      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body">
          <form [formGroup]="form" (ngSubmit)="onSearch()" class="row g-3 align-items-end">
            <div class="col-md-3">
              <label class="form-label">Diem den</label>
              <input type="text" class="form-control" formControlName="destination"
                     placeholder="VD: Da Nang, Tokyo...">
            </div>
            <div class="col-md-2">
              <label class="form-label">Gia tu (VND)</label>
              <input type="number" class="form-control" formControlName="priceMin" placeholder="0">
            </div>
            <div class="col-md-2">
              <label class="form-label">Gia den (VND)</label>
              <input type="number" class="form-control" formControlName="priceMax">
            </div>
            <div class="col-md-3">
              <label class="form-label">Ngay khoi hanh</label>
              <input type="date" class="form-control" formControlName="date">
            </div>
            <div class="col-md-2">
              <button type="submit" class="btn btn-primary w-100" [disabled]="loading">
                @if (loading) {
                  <span class="spinner-border spinner-border-sm me-1"></span>
                }
                <i class="bi bi-search me-1"></i>Tim
              </button>
            </div>
          </form>
        </div>
      </div>

      @if (searched && results.length === 0) {
        <div class="empty-state">
          <i class="bi bi-emoji-frown"></i>
          <p>Khong tim thay tour phu hop. Hay thu thay doi bo loc.</p>
        </div>
      }

      @if (results.length > 0) {
        <div class="row g-3">
          @for (tour of results; track tour.tourId) {
            <div class="col-md-4">
              <div class="card card-tour h-100">
                @if (tour.imageUrl) {
                  <img [src]="tour.imageUrl" class="card-img-top" [alt]="tour.tourName">
                } @else {
                  <div class="img-placeholder"><i class="bi bi-image"></i></div>
                }
                <div class="card-body d-flex flex-column">
                  <h6>{{ tour.tourName }}</h6>
                  <p class="text-muted small mb-1">
                    <i class="bi bi-geo-alt me-1"></i>{{ tour.desName }}
                    @if (tour.cateName) {
                      <span class="mx-1">|</span>
                      <i class="bi bi-tag me-1"></i>{{ tour.cateName }}
                    }
                  </p>
                  @if (tour.departureDate) {
                    <p class="small mb-1">
                      <i class="bi bi-calendar me-1"></i>{{ tour.departureDate }}
                      <span class="mx-1">|</span>
                      <i class="bi bi-people me-1"></i>{{ tour.availableSlots }} cho
                    </p>
                  }
                  <div class="mt-auto d-flex justify-content-between align-items-center">
                    <span class="fw-bold text-primary">{{ tour.price | number:'1.0-0' }} VND</span>
                    <a [routerLink]="['/tours', tour.tourId]"
                       class="btn btn-sm btn-outline-primary">Chi tiet</a>
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
