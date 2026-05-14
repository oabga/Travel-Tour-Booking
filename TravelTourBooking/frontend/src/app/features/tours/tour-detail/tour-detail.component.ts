import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TourService } from '../../../services/tour.service';
import { ReviewService } from '../../../services/review.service';
import { AuthService } from '../../../core/services/auth.service';
import { TourDetail } from '../../../shared/models';

@Component({
  selector: 'app-tour-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    @if (loading) {
      <div class="spinner-overlay py-5">
        <div class="spinner-border text-primary" role="status"></div>
      </div>
    } @else if (tour) {
      <div class="container py-4">
        <nav aria-label="breadcrumb" class="mb-3">
          <ol class="breadcrumb">
            <li class="breadcrumb-item"><a routerLink="/tours">Tours</a></li>
            <li class="breadcrumb-item active">{{ tour.tourName }}</li>
          </ol>
        </nav>

        <div class="row g-4">
          <!-- Left: Image + Info -->
          <div class="col-lg-8">
            <div class="card border-0 shadow-sm">
              @if (tour.imageUrl) {
                <img [src]="tour.imageUrl" class="card-img-top" style="height:400px;object-fit:cover"
                     [alt]="tour.tourName">
              } @else {
                <div class="img-placeholder" style="height:400px;font-size:4rem">
                  <i class="bi bi-image"></i>
                </div>
              }
              <div class="card-body">
                <h2>{{ tour.tourName }}</h2>
                <div class="d-flex flex-wrap gap-3 mb-3">
                  <span class="badge bg-primary-subtle text-primary">
                    <i class="bi bi-tag me-1"></i>{{ tour.cateName }}
                  </span>
                  <span class="badge bg-success-subtle text-success">
                    <i class="bi bi-geo-alt me-1"></i>{{ tour.desName }}, {{ tour.city }}, {{ tour.country }}
                  </span>
                  <span class="badge bg-info-subtle text-info">
                    <i class="bi bi-clock me-1"></i>{{ tour.durationDays }} ngay
                  </span>
                  <span class="badge bg-warning-subtle text-warning">
                    <i class="bi bi-people me-1"></i>{{ tour.maxCapacity }} nguoi
                  </span>
                </div>

                @if (tour.avgRating) {
                  <div class="mb-3">
                    <span class="text-warning fs-5">
                      @for (s of [1,2,3,4,5]; track s) {
                        <i class="bi" [class.bi-star-fill]="s <= (tour.avgRating ?? 0)"
                           [class.bi-star]="s > (tour.avgRating ?? 0)"></i>
                      }
                    </span>
                    <span class="ms-2">{{ tour.avgRating | number:'1.1-1' }}/5</span>
                    <span class="text-muted ms-1">({{ tour.totalReviews }} danh gia)</span>
                  </div>
                }

                <h4 class="text-primary fw-bold mb-3">{{ tour.price | number:'1.0-0' }} VND / nguoi</h4>

                @if (tour.description) {
                  <h5>Mo ta</h5>
                  <p>{{ tour.description }}</p>
                }
              </div>
            </div>

            <!-- Review Form (Customer only, inline) -->
            @if (auth.isAuthenticated() && auth.userRole() === 'Customer') {
              <div class="card border-0 shadow-sm mt-4">
                <div class="card-body">
                  <h5><i class="bi bi-chat-dots me-2"></i>Danh gia tour nay</h5>
                  @if (reviewMsg) {
                    <div class="alert" [class.alert-success]="reviewSuccess"
                         [class.alert-danger]="!reviewSuccess">{{ reviewMsg }}</div>
                  }
                  <form [formGroup]="reviewForm" (ngSubmit)="submitReview()">
                    <div class="mb-3">
                      <label class="form-label">Diem danh gia</label>
                      <div class="star-rating fs-4">
                        @for (s of [1,2,3,4,5]; track s) {
                          <i class="bi" (click)="setRating(s)"
                             [class.bi-star-fill]="s <= reviewForm.value.rating!"
                             [class.bi-star]="s > reviewForm.value.rating!"></i>
                        }
                      </div>
                    </div>
                    <div class="mb-3">
                      <textarea class="form-control" formControlName="comment"
                                rows="3" placeholder="Nhan xet cua ban..."></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary" [disabled]="reviewLoading">
                      @if (reviewLoading) {
                        <span class="spinner-border spinner-border-sm me-1"></span>
                      }
                      Gui danh gia
                    </button>
                  </form>
                </div>
              </div>
            }
          </div>

          <!-- Right: Schedules -->
          <div class="col-lg-4">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-primary text-white">
                <h5 class="mb-0"><i class="bi bi-calendar-event me-2"></i>Lich khoi hanh</h5>
              </div>
              <div class="card-body p-0">
                @if (tour.schedules.length === 0) {
                  <div class="p-3 text-center text-muted">Chua co lich khoi hanh.</div>
                } @else {
                  <div class="list-group list-group-flush">
                    @for (sch of tour.schedules; track sch.scheduleId) {
                      <div class="list-group-item">
                        <div class="d-flex justify-content-between mb-1">
                          <strong>{{ sch.departureDate }}</strong>
                          <span class="badge" [class]="sch.availableSlots > 0 ? 'bg-success' : 'bg-danger'">
                            {{ sch.availableSlots > 0 ? sch.availableSlots + ' cho trong' : 'Het cho' }}
                          </span>
                        </div>
                        <small class="text-muted d-block">
                          Ve: {{ sch.returnDate }}
                          @if (sch.employeeName) {
                            <br>HDV: {{ sch.employeeName }}
                          }
                        </small>
                        @if (auth.isAuthenticated() && auth.userRole() === 'Customer' && sch.availableSlots > 0) {
                          <a [routerLink]="['/bookings/new', sch.scheduleId]"
                             class="btn btn-sm btn-primary mt-2 w-100">
                            <i class="bi bi-cart-plus me-1"></i>Dat ngay
                          </a>
                        }
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    } @else {
      <div class="container py-5 text-center">
        <h4 class="text-muted">Tour khong ton tai.</h4>
        <a routerLink="/tours" class="btn btn-outline-primary mt-3">Quay lai danh sach</a>
      </div>
    }
  `
})
export class TourDetailComponent implements OnInit {
  tour: TourDetail | null = null;
  loading = true;

  reviewForm = this.fb.nonNullable.group({
    rating: [5, Validators.required],
    comment: ['']
  });
  reviewLoading = false;
  reviewMsg = '';
  reviewSuccess = false;

  constructor(
    private route: ActivatedRoute,
    private tourSvc: TourService,
    private reviewSvc: ReviewService,
    public auth: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.tourSvc.getById(id).subscribe({
      next: t => { this.tour = t; this.loading = false; },
      error: () => { this.tour = null; this.loading = false; }
    });
  }

  setRating(val: number): void {
    this.reviewForm.patchValue({ rating: val });
  }

  submitReview(): void {
    if (!this.tour || this.reviewForm.invalid) return;
    this.reviewLoading = true;
    this.reviewMsg = '';

    this.reviewSvc.create({
      tourId: this.tour.tourId,
      rating: this.reviewForm.value.rating!,
      comment: this.reviewForm.value.comment || undefined
    }).subscribe({
      next: () => {
        this.reviewLoading = false;
        this.reviewSuccess = true;
        this.reviewMsg = 'Cam on ban da danh gia!';
        this.reviewForm.reset({ rating: 5, comment: '' });
      },
      error: (err) => {
        this.reviewLoading = false;
        this.reviewSuccess = false;
        this.reviewMsg = err.error?.message || 'Ban can co booking Completed de danh gia.';
      }
    });
  }
}
