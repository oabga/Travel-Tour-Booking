import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { BookingService } from '../../../services/booking.service';
import { PaymentService } from '../../../services/payment.service';
import { AuthService } from '../../../core/services/auth.service';
import { BookingDetailView, PaymentDto } from '../../../shared/models';

@Component({
  selector: 'app-booking-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    @if (loading) {
      <div class="spinner-overlay py-5">
        <div class="spinner-border text-primary"></div>
      </div>
    } @else if (booking) {
      <div class="container py-4">
        <nav aria-label="breadcrumb" class="mb-3">
          <ol class="breadcrumb">
            <li class="breadcrumb-item">
              <a [routerLink]="auth.userRole() === 'Customer' ? '/bookings' : '/admin/bookings'">
                {{ auth.userRole() === 'Customer' ? 'Lich su' : 'Danh sách Booking' }}
              </a>
            </li>
            <li class="breadcrumb-item active">Booking #{{ booking.bookingId }}</li>
          </ol>
        </nav>

        @if (msg) {
          <div class="alert" [class.alert-success]="msgOk" [class.alert-danger]="!msgOk">{{ msg }}</div>
        }

        <div class="row g-4">
          <div class="col-lg-8">
            <!-- Booking Info -->
            <div class="card border-0 shadow-sm mb-4">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Chi tiet booking #{{ booking.bookingId }}</h5>
                <span class="badge badge-status fs-6" [ngClass]="booking.bookingStatus || ''">
                  {{ booking.bookingStatus }}
                </span>
              </div>
              <div class="card-body">
                <div class="row mb-2">
                  <div class="col-sm-4 text-muted">Tour:</div>
                  <div class="col-sm-8 fw-semibold">{{ booking.tourName }}</div>
                </div>
                <div class="row mb-2">
                  <div class="col-sm-4 text-muted">Diem den:</div>
                  <div class="col-sm-8">{{ booking.desName }}</div>
                </div>
                <div class="row mb-2">
                  <div class="col-sm-4 text-muted">Ngay di:</div>
                  <div class="col-sm-8">{{ booking.departureDate | date:'dd/MM/yyyy' }}</div>
                </div>
                <div class="row mb-2">
                  <div class="col-sm-4 text-muted">Ngay ve:</div>
                  <div class="col-sm-8">{{ booking.returnDate | date:'dd/MM/yyyy' }}</div>
                </div>
                <div class="row mb-2">
                  <div class="col-sm-4 text-muted">So nguoi:</div>
                  <div class="col-sm-8">{{ booking.numberOfPeople }}</div>
                </div>
                <div class="row mb-2">
                  <div class="col-sm-4 text-muted">Giam gia:</div>
                  <div class="col-sm-8">{{ booking.discountPercent }}%</div>
                </div>
                <div class="row mb-2">
                  <div class="col-sm-4 text-muted">Tong tien:</div>
                  <div class="col-sm-8 fw-bold text-primary fs-5">
                    {{ booking.totalAmount | number:'1.0-0' }} VND
                  </div>
                </div>
                @if (booking.notes) {
                  <div class="row mb-2">
                    <div class="col-sm-4 text-muted">Ghi chu:</div>
                    <div class="col-sm-8">{{ booking.notes }}</div>
                  </div>
                }
              </div>
            </div>

            <!-- Passengers -->
            <div class="card border-0 shadow-sm mb-4">
              <div class="card-header"><h5 class="mb-0">Hanh khach</h5></div>
              <div class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>#</th>
                      <th>Ho ten</th>
                      <th>Loai</th>
                      <th>CCCD/Passport</th>
                      <th>SDT</th>
                      <th>Ngay sinh</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (p of booking.passengers; track p.detailId; let i = $index) {
                      <tr>
                        <td>{{ i + 1 }}</td>
                        <td>{{ p.passengerName }}
                          @if (p.isPrimaryContact) {
                            <span class="badge bg-info ms-1">Chinh</span>
                          }
                        </td>
                        <td><span class="badge" [class.bg-primary]="p.passengerType==='Adult'"
                                  [class.bg-secondary]="p.passengerType==='Child'">{{ p.passengerType }}</span></td>
                        <td>{{ p.passengerIdNumber || '—' }}</td>
                        <td>{{ p.passengerPhone || '—' }}</td>
                        <td>{{ p.passengerDOB | date:'dd/MM/yyyy' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Cancel Button: Customer hủy Pending của mình; Staff/Admin hủy Pending hoặc Confirmed -->
            @if (canCancel) {
              <button class="btn btn-danger" (click)="cancelBooking()" [disabled]="cancelling">
                @if (cancelling) {
                  <span class="spinner-border spinner-border-sm me-1"></span>
                }
                <i class="bi bi-x-circle me-1"></i>
                {{ auth.userRole() === 'Customer' ? 'Hủy booking' : 'Hủy hộ khách' }}
              </button>
            }
          </div>

          <!-- Payments Sidebar -->
          <div class="col-lg-4">
            <div class="card border-0 shadow-sm mb-4">
              <div class="card-header"><h5 class="mb-0">Thanh toan</h5></div>
              <div class="card-body">
                <div class="d-flex justify-content-between mb-2">
                  <span>Da thanh toan:</span>
                  <strong class="text-success">{{ totalPaid | number:'1.0-0' }} VND</strong>
                </div>
                <div class="d-flex justify-content-between mb-3">
                  <span>Con lai:</span>
                  <strong class="text-danger">{{ remaining | number:'1.0-0' }} VND</strong>
                </div>

                @if (payments.length > 0) {
                  <hr>
                  @for (pay of payments; track pay.paymentId) {
                    <div class="mb-2 small">
                      <div class="d-flex justify-content-between">
                        <span>{{ pay.invoiceCode || '#' + pay.paymentId }}</span>
                        <span>{{ pay.amount | number:'1.0-0' }} VND</span>
                      </div>
                      <small class="text-muted">
                        {{ pay.paymentDate | date:'dd/MM/yyyy' }} — {{ pay.paymentMethod }}
                      </small>
                    </div>
                  }
                }
              </div>
            </div>

            <!-- Payment Form -->
            @if (booking.bookingStatus !== 'Cancelled' && remaining > 0) {
              <div class="card border-0 shadow-sm">
                <div class="card-header"><h6 class="mb-0">Thanh toan moi</h6></div>
                <div class="card-body">
                  <form [formGroup]="payForm" (ngSubmit)="submitPayment()">
                    <div class="mb-2">
                      <label class="form-label">So tien (VND)</label>
                      <input type="number" class="form-control" formControlName="amount">
                    </div>
                    <div class="mb-2">
                      <label class="form-label">Phuong thuc</label>
                      <select class="form-select" formControlName="paymentMethod">
                        <option value="BankTransfer">Chuyen khoan</option>
                        <option value="VNPay">VNPay</option>
                        <option value="MoMo">MoMo</option>
                        <option value="Cash">Tien mat</option>
                      </select>
                    </div>
                    <div class="mb-2">
                      <label class="form-label">Ma giao dich</label>
                      <input type="text" class="form-control" formControlName="transactionCode">
                    </div>
                    <button type="submit" class="btn btn-success w-100 mt-2"
                            [disabled]="payLoading || payForm.invalid">
                      @if (payLoading) {
                        <span class="spinner-border spinner-border-sm me-1"></span>
                      }
                      Thanh toan
                    </button>
                  </form>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `
})
export class BookingDetailComponent implements OnInit {
  booking: BookingDetailView | null = null;
  payments: PaymentDto[] = [];
  totalPaid = 0;
  remaining = 0;
  loading = true;
  cancelling = false;
  msg = '';
  msgOk = false;
  payLoading = false;

  // Customer: chỉ hủy Pending; Staff/Admin: hủy cả Pending và Confirmed
  get canCancel(): boolean {
    if (!this.booking) return false;
    const role = this.auth.userRole();
    const status = this.booking.bookingStatus;
    if (role === 'Customer') return status === 'Pending';
    if (role === 'Staff' || role === 'Admin') return status === 'Pending' || status === 'Confirmed';
    return false;
  }

  payForm = this.fb.nonNullable.group({
    amount: [0, [Validators.required, Validators.min(1)]],
    paymentMethod: ['BankTransfer'],
    transactionCode: ['']
  });

  constructor(
    private route: ActivatedRoute,
    private bookingSvc: BookingService,
    private paymentSvc: PaymentService,
    public auth: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  private loadAll(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.bookingSvc.getById(id).subscribe({
      next: b => {
        this.booking = b;
        this.loading = false;
        this.loadPayments(id);
      },
      error: () => this.loading = false
    });
  }

  private loadPayments(bookingId: number): void {
    this.paymentSvc.getByBooking(bookingId).subscribe(p => this.payments = p);
    this.paymentSvc.getTotalPaid(bookingId).subscribe(v => this.totalPaid = v);
    this.paymentSvc.getRemaining(bookingId).subscribe(v => this.remaining = v);
  }

  cancelBooking(): void {
    if (!this.booking) return;
    this.cancelling = true;
    this.bookingSvc.cancel(this.booking.bookingId).subscribe({
      next: () => {
        this.msg = 'Da huy booking thanh cong.';
        this.msgOk = true;
        this.cancelling = false;
        this.loadAll();
      },
      error: err => {
        this.msg = err.error?.message || 'Huy booking that bai.';
        this.msgOk = false;
        this.cancelling = false;
      }
    });
  }

  submitPayment(): void {
    if (!this.booking || this.payForm.invalid) return;
    this.payLoading = true;
    const val = this.payForm.getRawValue();
    this.paymentSvc.create({
      bookingId: this.booking.bookingId,
      amount: val.amount,
      paymentMethod: val.paymentMethod,
      status: 'Completed',
      transactionCode: val.transactionCode || undefined
    }).subscribe({
      next: () => {
        this.payLoading = false;
        this.msg = 'Thanh toan thanh cong!';
        this.msgOk = true;
        this.payForm.reset({ amount: 0, paymentMethod: 'BankTransfer', transactionCode: '' });
        this.loadPayments(this.booking!.bookingId);
      },
      error: err => {
        this.payLoading = false;
        this.msg = err.error?.message || 'Thanh toan that bai.';
        this.msgOk = false;
      }
    });
  }
}
