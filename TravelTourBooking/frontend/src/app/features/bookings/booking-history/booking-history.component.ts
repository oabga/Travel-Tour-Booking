import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookingService } from '../../../services/booking.service';
import { AuthService } from '../../../core/services/auth.service';
import { BookingHistory } from '../../../shared/models';

@Component({
  selector: 'app-booking-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container py-4">
      <h3 class="mb-4"><i class="bi bi-journal-text me-2"></i>Lich su dat tour</h3>

      @if (loading) {
        <div class="spinner-overlay">
          <div class="spinner-border text-primary"></div>
        </div>
      } @else if (bookings.length === 0) {
        <div class="empty-state">
          <i class="bi bi-journal-x"></i>
          <p>Ban chua co booking nao.</p>
          <a routerLink="/tours" class="btn btn-primary">Tim tour ngay</a>
        </div>
      } @else {
        <div class="table-responsive">
          <table class="table table-hover align-middle">
            <thead class="table-light">
              <tr>
                <th>#</th>
                <th>Tour</th>
                <th>Diem den</th>
                <th>Ngay di</th>
                <th>So nguoi</th>
                <th>Tong tien</th>
                <th>Trang thai</th>
                <th>Ngay dat</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (b of bookings; track b.bookingId) {
                <tr>
                  <td>{{ b.bookingId }}</td>
                  <td>{{ b.tourName }}</td>
                  <td>{{ b.desName }}</td>
                  <td>{{ b.departureDate | date:'dd/MM/yyyy' }}</td>
                  <td>{{ b.numberOfPeople }}</td>
                  <td>{{ b.totalAmount | number:'1.0-0' }} VND</td>
                  <td>
                    <span class="badge badge-status" [ngClass]="b.status || ''">
                      {{ b.status }}
                    </span>
                  </td>
                  <td>{{ b.bookingDate | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td>
                    <a [routerLink]="['/bookings', b.bookingId]"
                       class="btn btn-sm btn-outline-primary">
                      <i class="bi bi-eye"></i>
                    </a>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `
})
export class BookingHistoryComponent implements OnInit {
  bookings: BookingHistory[] = [];
  loading = true;

  constructor(
    private bookingSvc: BookingService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.auth.userId();
    if (!id) { this.loading = false; return; }
    this.bookingSvc.getByAccount(id).subscribe({
      next: data => { this.bookings = data; this.loading = false; },
      error: () => this.loading = false
    });
  }
}
