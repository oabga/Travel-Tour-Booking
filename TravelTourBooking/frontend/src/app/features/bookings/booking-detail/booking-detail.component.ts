import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { BookingService } from '../../../services/booking.service';
import { PaymentService } from '../../../services/payment.service';
import { AuthService } from '../../../core/services/auth.service';
import { BookingDetailView, PaymentDto } from '../../../shared/models';

@Component({
  selector: 'app-booking-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule],
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
                {{ auth.userRole() === 'Customer' ? 'Lịch sử' : 'Danh sách Booking' }}
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
                <h5 class="mb-0">Chi tiết booking #{{ booking.bookingId }}</h5>
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
                  <div class="col-sm-4 text-muted">Điểm đến:</div>
                  <div class="col-sm-8">{{ booking.desName }}</div>
                </div>
                <div class="row mb-2">
                  <div class="col-sm-4 text-muted">Ngày đi:</div>
                  <div class="col-sm-8">{{ booking.departureDate | date:'dd/MM/yyyy' }}</div>
                </div>
                <div class="row mb-2">
                  <div class="col-sm-4 text-muted">Ngày về:</div>
                  <div class="col-sm-8">{{ booking.returnDate | date:'dd/MM/yyyy' }}</div>
                </div>
                <div class="row mb-2">
                  <div class="col-sm-4 text-muted">Số người:</div>
                  <div class="col-sm-8">{{ booking.numberOfPeople }}</div>
                </div>
                <div class="row mb-2">
                  <div class="col-sm-4 text-muted">Giảm giá:</div>
                  <div class="col-sm-8">{{ booking.discountPercent }}%</div>
                </div>
                <div class="row mb-2">
                  <div class="col-sm-4 text-muted">Tổng tiền:</div>
                  <div class="col-sm-8 fw-bold text-primary fs-5">
                    {{ booking.totalAmount | number:'1.0-0' }} VND
                  </div>
                </div>
                @if (booking.notes) {
                  <div class="row mb-2">
                    <div class="col-sm-4 text-muted">Ghi chú:</div>
                    <div class="col-sm-8">{{ booking.notes }}</div>
                  </div>
                }
              </div>
            </div>

            <!-- Passengers -->
            <div class="card border-0 shadow-sm mb-4">
              <div class="card-header"><h5 class="mb-0">Hành khách</h5></div>
              <div class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>#</th>
                      <th>Họ tên</th>
                      <th>Loại</th>
                      <th>CCCD/Passport</th>
                      <th>SDT</th>
                      <th>Ngày sinh</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (p of booking.passengers; track p.detailId; let i = $index) {
                      <tr>
                        <td>{{ i + 1 }}</td>
                        <td>{{ p.passengerName }}
                          @if (p.isPrimaryContact) {
                            <span class="badge bg-info ms-1">Chính</span>
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
              <div class="card-header"><h5 class="mb-0">Thanh toán</h5></div>
              <div class="card-body">
                <div class="d-flex justify-content-between mb-2">
                  <span>Đã thanh toán:</span>
                  <strong class="text-success">{{ totalPaid | number:'1.0-0' }} VND</strong>
                </div>
                <div class="d-flex justify-content-between mb-3">
                  <span>Còn lại:</span>
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

                      @if (auth.userRole() !== 'Customer' && pay.status === 'Pending') {
                        <div class="mt-2 d-flex gap-1 flex-wrap">
                          <button type="button" class="btn btn-sm btn-success"
                                  (click)="openConfirmModal(pay)">
                            Xác nhận
                          </button>
                          <button type="button" class="btn btn-sm btn-outline-danger"
                                  (click)="rejectPayment(pay.paymentId)" [disabled]="rejecting">
                            Từ chối
                          </button>
                        </div>
                      }

                      @if (pay.status === 'Pending') {
                        <span class="badge bg-warning text-dark mt-1 d-block mt-1">Chờ xác minh</span>
                      }
                      @if (pay.status === 'Failed') {
                        <span class="badge bg-secondary mt-1 d-block">Đã từ chối</span>
                      }
                      @if (pay.status === 'Completed') {
                        <span class="badge bg-success mt-1 d-block">Đã xác nhận</span>
                      }
                    </div>
                  }
                }
              </div>
            </div>
            @if (auth.userRole() === 'Customer' && booking.bookingStatus === 'Pending' && remaining > 0 && !hasBlockingPayment) {
              <a [routerLink]="['/bookings', booking.bookingId, 'payment']"
                 class="btn btn-success w-100 mb-3">
                <i class="bi bi-qr-code me-1"></i> Thanh toán MoMo (QR)
              </a>
            }
            @if (auth.userRole() === 'Staff') {
            <!-- Payment Form (Staff: tiền mặt) -->
            @if (booking.bookingStatus !== 'Cancelled' && remaining > 0) {
              <div class="card border-0 shadow-sm">
                <div class="card-header"><h6 class="mb-0">Thanh toán mới</h6></div>
                <div class="card-body">
                  <form [formGroup]="payForm" (ngSubmit)="submitPayment()">
                    <div class="mb-2">
                      <label class="form-label">Số tiền (VND)</label>
                      <input type="number" class="form-control" formControlName="amount">
                    </div>
                    
                    <input type="hidden" formControlName="paymentMethod" value="Cash">
                    <button type="submit" class="btn btn-success w-100 mt-2"
                            [disabled]="payLoading || payForm.invalid">
                      @if (payLoading) {
                        <span class="spinner-border spinner-border-sm me-1"></span>
                      }
                      Thanh toán
                    </button>
                  </form>
                </div>
              </div>
            } 
            }
          </div>
        </div>

        @if (confirmPaymentId !== null) {
          <div class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,.5)">
            <div class="modal-dialog modal-dialog-centered">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title">Xác nhận thanh toán</h5>
                  <button type="button" class="btn-close" (click)="closeConfirmModal()"></button>
                </div>
                <div class="modal-body">
                  <p class="small text-muted mb-2">
                    Đối chiếu app MoMo. Còn phải thu: <strong>{{ remaining | number:'1.0-0' }} VND</strong>
                  </p>
                  <label class="form-label fw-semibold">Số tiền thực nhận (VND)</label>
                  <input type="number" class="form-control form-control-lg" [(ngModel)]="verifiedAmount"
                         [ngModelOptions]="{standalone: true}" min="1">
                  @if (verifiedAmount > 0 && remaining > 0) {
                    <p class="small mt-2 mb-0"
                       [class.text-success]="verifiedAmount >= remaining"
                       [class.text-warning]="verifiedAmount > 0 && verifiedAmount < remaining"
                       [class.text-danger]="verifiedAmount > remaining">
                      @if (verifiedAmount < remaining) {
                        Thiếu {{ remaining - verifiedAmount | number:'1.0-0' }} VND
                      } @else if (verifiedAmount > remaining) {
                        Thừa {{ verifiedAmount - remaining | number:'1.0-0' }} VND
                      } @else {
                        Khớp số tiền cần thu
                      }
                    </p>
                  }
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" (click)="closeConfirmModal()">Đóng</button>
                  <button type="button" class="btn btn-success" (click)="confirmPaymentWithAmount()"
                          [disabled]="confirming || verifiedAmount <= 0">
                    @if (confirming) {
                      <span class="spinner-border spinner-border-sm me-1"></span>
                    }
                    Xác nhận
                  </button>
                </div>
              </div>
            </div>
          </div>
        }
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
  rejecting = false;
  confirming = false;
  confirmPaymentId: number | null = null;
  verifiedAmount = 0;

  get hasBlockingPayment(): boolean {
    return this.payments.some(p => p.status === 'Pending' || p.status === 'Completed');
  }

  get canCancel(): boolean {
    if (!this.booking || this.hasBlockingPayment) return false;
    const status = this.booking.bookingStatus;
    return status === 'Pending';
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

    const role = this.auth.userRole();

    this.payForm.patchValue({
      paymentMethod: role === 'Staff' ? 'Cash' : 'BankTransfer'
    });
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

  openConfirmModal(pay: PaymentDto): void {
    this.confirmPaymentId = pay.paymentId;
    this.verifiedAmount = pay.amount || this.remaining;
  }

  closeConfirmModal(): void {
    this.confirmPaymentId = null;
  }

  confirmPaymentWithAmount(): void {
    if (this.confirmPaymentId === null) return;
    this.confirming = true;
    this.paymentSvc.confirm(this.confirmPaymentId, this.verifiedAmount).subscribe({
      next: res => {
        this.confirming = false;
        this.closeConfirmModal();
        this.msg = res.message;
        this.msgOk = res.success;
        this.loadAll();
      },
      error: err => {
        this.confirming = false;
        this.msg = err.error?.message ?? 'Xác nhận thất bại.';
        this.msgOk = false;
      }
    });
  }

  rejectPayment(id: number): void {
    if (!confirm('Từ chối giao dịch này? Khách có thể gửi lại mã nếu còn thời hạn thanh toán.')) return;
    this.rejecting = true;
    this.paymentSvc.reject(id).subscribe({
      next: res => {
        this.rejecting = false;
        this.msg = res.message;
        this.msgOk = true;
        this.loadAll();
      },
      error: err => {
        this.rejecting = false;
        this.msg = err.error?.message ?? 'Từ chối thất bại.';
        this.msgOk = false;
      }
    });
  }

  cancelBooking(): void {
    if (!this.booking) return;
    this.cancelling = true;
    this.bookingSvc.cancel(this.booking.bookingId).subscribe({
      next: () => {
        this.msg = 'Đã hủy booking thành công.';
        this.msgOk = true;
        this.cancelling = false;
        this.loadAll();
      },
      error: err => {
        this.msg = err.error?.message || 'Hủy booking thất bại.';
        this.msgOk = false;
        this.cancelling = false;
      }
    });
  }

  private handleSuccess = () => {
  this.payLoading = false;
  this.msg = 'Thanh toán thành công!';
  this.msgOk = true;
  this.loadPayments(this.booking!.bookingId);
  };

  private handleError = (err: any) => {
    this.payLoading = false;
    this.msg = err.error?.message || 'Thanh toán thất bại.';
    this.msgOk = false;
  };

  submitPayment(): void {
    if (!this.booking || this.payForm.invalid) return;
    this.payLoading = true;
    const val = this.payForm.getRawValue();
    if (val.paymentMethod === 'Cash') {
    this.paymentSvc.createCashPayment({
      bookingId: this.booking.bookingId,
      amount: val.amount
    }).subscribe(this.handleSuccess, this.handleError);
    return;
    }
    if (this.auth.userRole() === 'Customer') {
      this.paymentSvc.submit({
        bookingId: this.booking.bookingId,
        amount: val.amount,
        paymentMethod: val.paymentMethod,
        transactionCode: val.transactionCode
      }).subscribe({
        next: res => {
          this.payLoading = false;
          this.msg = res.message;
          this.msgOk = true;
          this.loadAll();
        },
        error: this.handleError
      });
      return;
    }
    this.paymentSvc.createBankTransfer({
      bookingId: this.booking.bookingId,
      amount: val.amount,
      paymentMethod: val.paymentMethod,
      transactionCode: val.transactionCode
    }).subscribe(this.handleSuccess, this.handleError);
  }
}
