import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReviewService } from '../../../services/review.service';
import { ReviewResponse } from '../../../shared/models';

@Component({
  selector: 'app-testimonials-section',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (reviews.length) {
      <section class="testimonials-section py-5">
        <div class="container">
          <div class="text-center mb-4">
            <h2 class="section-title"><i class="bi bi-chat-quote text-primary me-2"></i>Khách hàng nói gì?</h2>
            <p class="section-subtitle mb-0">Trải nghiệm thực tế từ những chuyến đi đã đặt</p>
          </div>
          <div class="row g-4">
            @for (r of reviews; track r.reviewId) {
              <div class="col-md-6 col-lg-4">
                <div class="testimonial-card h-100">
                  <div class="testimonial-stars text-warning mb-2">
                    @for (s of [1,2,3,4,5]; track s) {
                      <i class="bi" [class.bi-star-fill]="s <= r.rating" [class.bi-star]="s > r.rating"></i>
                    }
                  </div>
                  @if (r.comment) {
                    <p class="testimonial-text">"{{ r.comment }}"</p>
                  }
                  <div class="testimonial-footer mt-auto pt-3">
                    <strong class="d-block">{{ r.userName }}</strong>
                    @if (r.tourName) {
                      <a [routerLink]="['/tours', r.tourId]" class="small text-primary text-decoration-none">
                        <i class="bi bi-map me-1"></i>{{ r.tourName }}
                      </a>
                    }
                    <small class="text-muted d-block mt-1">{{ r.reviewDate | date:'dd/MM/yyyy' }}</small>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </section>
    }
  `
})
export class TestimonialsSectionComponent implements OnInit {
  reviews: ReviewResponse[] = [];

  constructor(private reviewSvc: ReviewService) {}

  ngOnInit(): void {
    this.reviewSvc.getRecent(6).subscribe({
      next: r => this.reviews = r,
      error: () => this.reviews = []
    });
  }
}
