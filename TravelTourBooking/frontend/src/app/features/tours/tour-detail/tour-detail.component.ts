import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TourService } from '../../../services/tour.service';
import { ReviewService } from '../../../services/review.service';
import { AuthService } from '../../../core/services/auth.service';
import { TourDetail, TourList, ReviewResponse } from '../../../shared/models';
import { environment } from '../../../../environments/environment';
import { getCategoryStockImage, getDestinationStockImage } from '../../../shared/utils/category-image.util';
import { getTourDisplayImageUrl } from '../../../shared/utils/tour-image.util';

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
          <div class="col-lg-8">
            <div class="tour-gallery card border-0 shadow-sm overflow-hidden mb-4">
              <div class="row g-2 p-2">
                <div class="col-md-8">
                  <img [src]="galleryUrls[selectedGalleryIndex]"
                       class="tour-gallery-main w-100 rounded-3"
                       [alt]="tour.tourName"
                       (error)="handleImageError($event)">
                </div>
                <div class="col-md-4 d-flex flex-md-column gap-2">
                  @for (url of galleryUrls; track url; let i = $index) {
                    @if (i < 4) {
                      <img [src]="url" class="tour-gallery-thumb rounded-3 flex-fill"
                           [class.active]="i === selectedGalleryIndex"
                           (click)="selectedGalleryIndex = i"
                           [alt]="'Ảnh ' + (i + 1)">
                    }
                  }
                </div>
              </div>
            </div>

            <div class="card border-0 shadow-sm">
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
                    <i class="bi bi-clock me-1"></i>{{ tour.durationDays }} ngày
                  </span>
                  <span class="badge bg-warning-subtle text-warning">
                    <i class="bi bi-people me-1"></i>{{ tour.maxCapacity }} người
                  </span>
                </div>

                @if (tour.avgRating) {
                  <div class="mb-3">
                    <span class="text-warning fs-5">
                      @for (s of [1,2,3,4,5]; track s) {
                        <i class="bi" [class.bi-star-fill]="s <= (tour.avgRating)"
                           [class.bi-star]="s > (tour.avgRating)"></i>
                      }
                    </span>
                    <span class="ms-2">{{ tour.avgRating | number:'1.1-1' }}/5</span>
                    <span class="text-muted ms-1">({{ tour.totalReviews }} đánh giá)</span>
                  </div>
                }

                <h4 class="text-primary fw-bold mb-3">{{ tour.price | number:'1.0-0' }} VND / người</h4>

                @if (tour.description) {
                  <h5>Mô tả tour</h5>
                  <p style="white-space: pre-line;">{{ tour.description }}</p>
                }

                @if (mapUrl) {
                  <h5 class="mt-4"><i class="bi bi-map me-2"></i>Điểm đến</h5>
                  <div class="ratio ratio-21x9 rounded-3 overflow-hidden shadow-sm map-embed">
                    <iframe [src]="mapUrl" title="Bản đồ" loading="lazy"
                            referrerpolicy="no-referrer-when-downgrade"></iframe>
                  </div>
                }
              </div>
            </div>

            @if (auth.isAuthenticated() && auth.userRole() === 'Customer') {
              <div class="card border-0 shadow-sm mt-4">
                <div class="card-body">
                  <h5><i class="bi bi-chat-dots me-2"></i>Đánh giá tour này</h5>
                  @if (reviewMsg) {
                    <div class="alert" [class.alert-success]="reviewSuccess"
                         [class.alert-danger]="!reviewSuccess">{{ reviewMsg }}</div>
                  }
                  <form [formGroup]="reviewForm" (ngSubmit)="submitReview()">
                    <div class="mb-3">
                      <label class="form-label">Điểm đánh giá</label>
                      <div class="star-rating fs-4">
                        @for (s of [1,2,3,4,5]; track s) {
                          <i class="bi cursor-pointer" (click)="setRating(s)"
                             [class.bi-star-fill]="s <= reviewForm.value.rating!"
                             [class.bi-star]="s > reviewForm.value.rating!"></i>
                        }
                      </div>
                    </div>
                    <div class="mb-3">
                      <textarea class="form-control" formControlName="comment"
                                rows="3" placeholder="Nhận xét của bạn..."></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary" [disabled]="reviewLoading">
                      @if (reviewLoading) {
                        <span class="spinner-border spinner-border-sm me-1"></span>
                      }
                      Gửi đánh giá
                    </button>
                  </form>
                </div>
              </div>
            }

            @if (reviews.length > 0) {
              <div class="card border-0 shadow-sm mt-4">
                <div class="card-body">
                  <h5><i class="bi bi-chat-square-text me-2"></i>Đánh giá từ khách hàng ({{ reviews.length }})</h5>
                  @for (r of reviews; track r.reviewId) {
                    <div class="border-bottom py-3">
                      <div class="d-flex justify-content-between align-items-center mb-1">
                        <div>
                          <strong>{{ r.userName }}</strong>
                          <span class="text-warning ms-2">
                            @for (s of [1,2,3,4,5]; track s) {
                              <i class="bi" [class.bi-star-fill]="s <= r.rating" [class.bi-star]="s > r.rating"></i>
                            }
                          </span>
                        </div>
                        <small class="text-muted">{{ r.reviewDate | date:'dd/MM/yyyy' }}</small>
                      </div>
                      @if (r.comment) {
                        <p class="text-muted mb-0 mt-1">{{ r.comment }}</p>
                      }
                    </div>
                  }
                </div>
              </div>
            }
          </div>

          <div class="col-lg-4">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-primary text-white">
                <h5 class="mb-0"><i class="bi bi-calendar-event me-2"></i>Lịch khởi hành</h5>
              </div>
              <div class="card-body p-0">
                @if (tour.schedules.length === 0) {
                  <div class="p-3 text-center text-muted">Chưa có lịch khởi hành.</div>
                } @else {
                  <div class="list-group list-group-flush">
                    @for (sch of tour.schedules; track sch.scheduleId) {
                      <div class="list-group-item">
                        <div class="d-flex justify-content-between mb-1">
                          <strong>{{ sch.departureDate | date:'dd/MM/yyyy' }}</strong>
                          <span class="badge" [class]="sch.availableSlots > 0 ? 'bg-success' : 'bg-danger'">
                            {{ sch.availableSlots > 0 ? sch.availableSlots + ' chỗ trống' : 'Hết chỗ' }}
                          </span>
                        </div>
                        <small class="text-muted d-block">
                          Về: {{ sch.returnDate | date:'dd/MM/yyyy' }}
                          @if (sch.employeeName) {
                            <br>HDV: {{ sch.employeeName }}
                          }
                        </small>
                        @if (auth.isAuthenticated() && auth.userRole() === 'Customer' && sch.availableSlots > 0) {
                          <a [routerLink]="['/bookings/new', sch.scheduleId]"
                             class="btn btn-sm btn-primary mt-2 w-100">
                            <i class="bi bi-cart-plus me-1"></i>Đặt ngay
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

        @if (relatedTours.length) {
          <section class="mt-5">
            <h4 class="section-title mb-3"><i class="bi bi-collection me-2"></i>Tour tương tự</h4>
            <div class="row g-4">
              @for (rt of relatedTours; track rt.tourId) {
                <div class="col-md-6 col-lg-3">
                  <a [routerLink]="['/tours', rt.tourId]" class="text-decoration-none">
                    <div class="card card-tour card-tour-rich h-100">
                      <div class="card-img-wrapper">
                        <img [src]="tourImg(rt.imageUrl, rt.desName, rt.cateName)"
                             class="card-img-top" (error)="handleImageError($event)" [alt]="rt.tourName">
                      </div>
                      <div class="card-body">
                        <h6 class="card-title text-dark text-truncate">{{ rt.tourName }}</h6>
                        <span class="tour-price">{{ rt.price | number:'1.0-0' }}đ</span>
                      </div>
                    </div>
                  </a>
                </div>
              }
            </div>
          </section>
        }
      </div>
    } @else {
      <div class="container py-5 text-center">
        <h4 class="text-muted">Tour không tồn tại.</h4>
        <a routerLink="/tours" class="btn btn-outline-primary mt-3">Quay lại danh sách</a>
      </div>
    }
  `
})
export class TourDetailComponent implements OnInit {
    readonly environment = environment;
    readonly tourImg = getTourDisplayImageUrl;
    tour: TourDetail | null = null;
    loading = true;
    reviews: ReviewResponse[] = [];
    galleryUrls: string[] = ['/assets/images/default-tour.svg'];
    selectedGalleryIndex = 0;
    relatedTours: TourList[] = [];
    mapUrl: SafeResourceUrl | null = null;

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
        private fb: FormBuilder,
        private sanitizer: DomSanitizer
    ) { }

    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        this.tourSvc.getById(id).subscribe({
            next: t => {
                this.tour = t;
                this.galleryUrls = this.buildGalleryUrls(t);
                this.mapUrl = this.buildMapUrl(t);
                this.loadRelated(t);
                this.loading = false;
            },
            error: () => { this.tour = null; this.loading = false; }
        });
        this.reviewSvc.getByTour(id).subscribe(r => this.reviews = r);
    }

    buildGalleryUrls(tour: TourDetail): string[] {
        const main = getTourDisplayImageUrl(tour.imageUrl, tour.desName, tour.cateName);
        const extras = [
            getDestinationStockImage(tour.desName),
            getDestinationStockImage(tour.city),
            getCategoryStockImage(tour.cateName ?? ''),
        ];
        const all = [main, ...extras];
        return [...new Set(all)].slice(0, 4);
    }

    buildMapUrl(tour: TourDetail): SafeResourceUrl {
        const q = encodeURIComponent(
            [tour.desName, tour.city, tour.country].filter(Boolean).join(', ')
        );
        return this.sanitizer.bypassSecurityTrustResourceUrl(
            `https://maps.google.com/maps?q=${q}&z=12&output=embed`
        );
    }

    loadRelated(tour: TourDetail): void {
        this.tourSvc.getAll(1, 16).subscribe(res => {
            this.relatedTours = res.items
                .filter(t => t.tourId !== tour.tourId && t.cateName === tour.cateName)
                .slice(0, 4);
        });
    }

    handleImageError(event: any): void {
        event.target.src = '/assets/images/default-tour.jpg';
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
                this.reviewMsg = 'Cảm ơn bạn đã đánh giá!';
                this.reviewForm.reset({ rating: 5, comment: '' });
            },
            error: (err) => {
                this.reviewLoading = false;
                this.reviewSuccess = false;
                this.reviewMsg = err.error?.message || 'Bạn cần có booking Hoàn thành để đánh giá.';
            }
        });
    }
}