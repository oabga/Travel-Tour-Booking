import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { BookingService } from '../../../services/booking.service';
import { PaymentService } from '../../../services/payment.service';
import { AuthService } from '../../../core/services/auth.service';
import { BookingDetailView, PaymentConfig } from '../../../shared/models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-booking-payment',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="container py-4">
      <nav aria-label="breadcrumb" class="mb-3">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a routerLink="/">Trang chủ</a></li>
          <li class="breadcrumb-item"><a routerLink="/bookings">Lịch sử</a></li>
          <li class="breadcrumb-item active">Thanh toán</li>
        </ol>
      </nav>

      <ul class="booking-steps list-unstyled d-flex flex-wrap gap-2 mb-4">
        <li class="booking-step done"><span>1</span> Thông tin đặt tour</li>
        <li class="booking-step" [class.active]="!submittedPending" [class.done]="submittedPending || paidComplete">
          <span>2</span> Thanh toán
        </li>
        <li class="booking-step" [class.done]="paidComplete"><span>3</span> Hoàn tất</li>
      </ul>

      @if (loading) {
        <div class="text-center py-5"><div class="spinner-border text-primary"></div></div>
      } @else if (!booking) {
        <div class="alert alert-danger">Không tìm thấy booking.</div>
      } @else if (sessionCancelled || booking.bookingStatus === 'Cancelled') {
        <div class="card border-0 shadow-sm text-center py-5">
          <div class="card-body">
            <i class="bi bi-x-circle text-danger display-4 mb-3"></i>
            <h4 class="fw-bold">Đã hết thời gian giữ chỗ</h4>
            <p class="text-muted">{{ sessionMessage || 'Chỗ đã được trả cho khách khác. Vui lòng đặt tour lại.' }}</p>
            <a routerLink="/tours" class="btn btn-primary mt-2">Đặt tour khác</a>
          </div>
        </div>
      } @else if (paidComplete) {
        <div class="card border-0 shadow-sm text-center py-5">
          <div class="card-body">
            <i class="bi bi-check-circle-fill text-success display-4 mb-3"></i>
            <h4 class="fw-bold">Đặt tour đã được xác nhận!</h4>
            <p class="text-muted mb-2">{{ successMessage }}</p>
            @if (emailSent) {
              <p class="small text-success">
                <i class="bi bi-envelope-check me-1"></i>
                Email xác nhận đã gửi tới <strong>{{ auth.user()?.email }}</strong>
              </p>
            }
            <div class="d-flex gap-2 justify-content-center mt-4">
              <a [routerLink]="['/bookings', booking.bookingId]" class="btn btn-outline-primary">Chi tiết booking</a>
              <a routerLink="/bookings" class="btn btn-primary">Lịch sử</a>
            </div>
          </div>
        </div>
      } @else if (submittedPending) {
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center py-5">
            <i class="bi bi-hourglass-split text-warning display-4 mb-3"></i>
            <h4 class="fw-bold">Đã ghi nhận thanh toán</h4>
            <p class="text-muted">{{ successMessage }}</p>
            @if (emailSent) {
              <p class="small text-success"><i class="bi bi-envelope me-1"></i>Đã gửi email thông báo tới bạn.</p>
            } @else {
              <p class="small text-danger">
                <i class="bi bi-exclamation-triangle me-1"></i>
                Chưa gửi được email{{ emailError ? ': ' + emailError : '' }}
              </p>
            }
            <p class="small text-muted mt-3">
              Nhân viên sẽ đối chiếu số tiền trên MoMo và xác nhận trong 24h.
            </p>
            <a [routerLink]="['/bookings', booking.bookingId]" class="btn btn-outline-primary mt-2">Xem trạng thái</a>
          </div>
        </div>
      } @else {
        <div class="row g-4">
          <div class="col-lg-7">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-white border-0 pt-4 px-4">
                <h4 class="mb-0"><i class="bi bi-qr-code text-danger me-2"></i>Thanh toán MoMo</h4>
                <p class="text-muted small mb-0">Quét mã QR → chuyển đúng số tiền → nhập mã giao dịch</p>
              </div>
              <div class="card-body px-4 pb-4">
                @if (errorMsg) {
                  <div class="alert alert-danger">{{ errorMsg }}</div>
                }

                <div class="alert mb-4 d-flex align-items-center gap-2"
                     [class.alert-warning]="remainingSeconds > 0 && remainingSeconds <= 60"
                     [class.alert-info]="remainingSeconds > 60"
                     [class.alert-danger]="remainingSeconds <= 0 && !sessionExpired">
                  <i class="bi bi-clock-history fs-4"></i>
                  <div>
                    @if (remainingSeconds > 0) {
                      <strong>Còn {{ countdownLabel }}</strong> để gửi mã giao dịch
                    } @else {
                      <strong>Đang hết hạn phiên thanh toán...</strong>
                    }
                    <div class="small mb-0 d-block text-muted">Chuyển đúng số tiền hiển thị bên dưới</div>
                  </div>
                </div>

                <div class="payment-qr-box text-center mb-4 p-3 bg-light rounded-4">
                  <img [src]="momoQrFullUrl" alt="QR MoMo" class="payment-qr-img mb-3"
                       (error)="onQrError($event)">
                  <p class="mb-1 fw-semibold">{{ payConfig?.moMoAccountName }}</p>
                  @if (payConfig?.moMoPhone) {
                    <p class="text-muted small mb-2">SĐT MoMo: <strong>{{ payConfig!.moMoPhone }}</strong></p>
                  }
                  <p class="mb-0">
                    <span class="badge bg-danger fs-6">Số tiền: {{ remaining | number:'1.0-0' }} VND</span>
                  </p>
                  <p class="small text-muted mt-2 mb-0">
                    Nội dung CK: <code class="user-select-all">{{ transferNote }}</code>
                  </p>
                </div>

                @if (payConfig?.bankAccountNumber) {
                  <div class="alert alert-secondary small mb-4">
                    <strong>Hoặc chuyển khoản:</strong><br>
                    {{ payConfig!.bankName }} — {{ payConfig!.bankAccountNumber }}<br>
                    Chủ TK: {{ payConfig!.bankAccountName }}
                  </div>
                }

                <form [formGroup]="payForm" (ngSubmit)="submitPayment()">
                  <div class="mb-3">
                    <label class="form-label fw-semibold">Mã giao dịch MoMo *</label>
                    <input type="text" class="form-control form-control-lg" formControlName="transactionCode"
                           placeholder="VD: 12345678901"
                           [disabled]="sessionExpired || payLoading">
                    <small class="text-muted">Lấy trong lịch sử giao dịch app MoMo sau khi chuyển</small>
                  </div>
                  <button type="submit" class="btn btn-success btn-lg w-100"
                          [disabled]="sessionExpired || payLoading || payForm.invalid">
                    @if (payLoading) {
                      <span class="spinner-border spinner-border-sm me-2"></span>
                    }
                    <i class="bi bi-check2-circle me-2"></i>Tôi đã chuyển tiền — gửi xác nhận
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div class="col-lg-5">
            <div class="card border-0 shadow-sm sticky-top" style="top: 1rem;">
              <div class="card-header bg-primary text-white">
                <h6 class="mb-0">Đơn hàng #{{ booking.bookingId }}</h6>
              </div>
              <div class="card-body">
                <p class="fw-bold mb-1">{{ booking.tourName }}</p>
                <p class="text-muted small mb-2"><i class="bi bi-geo-alt me-1"></i>{{ booking.desName }}</p>
                <p class="small mb-1">
                  <i class="bi bi-calendar-event me-1"></i>
                  {{ booking.departureDate | date:'dd/MM/yyyy' }} → {{ booking.returnDate | date:'dd/MM/yyyy' }}
                </p>
                <p class="small mb-3"><i class="bi bi-people me-1"></i>{{ booking.numberOfPeople }} khách</p>
                <hr>
                <div class="d-flex justify-content-between fs-5 fw-bold text-danger">
                  <span>Cần thanh toán</span>
                  <span>{{ remaining | number:'1.0-0' }} VND</span>
                </div>
                <span class="badge bg-warning text-dark mt-3">Chờ thanh toán</span>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class BookingPaymentComponent implements OnInit, OnDestroy {
  readonly environment = environment;
  booking: BookingDetailView | null = null;
  payConfig: PaymentConfig | null = null;
  momoQrFullUrl = '';
  transferNote = '';
  loading = true;
  payLoading = false;
  totalPaid = 0;
  remaining = 0;
  paidComplete = false;
  submittedPending = false;
  sessionExpired = false;
  sessionCancelled = false;
  sessionMessage = '';
  remainingSeconds = 0;
  emailSent = false;
  emailError = '';
  successMessage = '';
  errorMsg = '';

  private timerId: ReturnType<typeof setInterval> | null = null;
  private bookingId = 0;

  payForm = this.fb.nonNullable.group({
    paymentMethod: ['MoMo'],
    transactionCode: ['', Validators.required]
  });

  get countdownLabel(): string {
    const m = Math.floor(this.remainingSeconds / 60);
    const s = this.remainingSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  constructor(
    private route: ActivatedRoute,
    private bookingSvc: BookingService,
    private paymentSvc: PaymentService,
    public auth: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.bookingId = Number(this.route.snapshot.paramMap.get('id'));

    this.paymentSvc.getConfig().subscribe({
      next: cfg => {
        this.payConfig = cfg;
        const path = cfg.moMoQrUrl.startsWith('/') ? cfg.moMoQrUrl : `/${cfg.moMoQrUrl}`;
        this.momoQrFullUrl = environment.imageBaseUrl + path;
      }
    });

    this.bookingSvc.getById(this.bookingId).subscribe({
      next: b => {
        this.booking = b;
        this.transferNote = `${this.payConfig?.transferNotePrefix ?? 'TT'}${b.bookingId}`;
        if (b.bookingStatus === 'Confirmed' || b.bookingStatus === 'Completed') {
          this.paidComplete = true;
          this.successMessage = 'Tour đã được xác nhận.';
          this.loading = false;
          return;
        }
        if (b.bookingStatus === 'Cancelled') {
          this.sessionCancelled = true;
          this.loading = false;
          return;
        }
        this.paymentSvc.getByBooking(this.bookingId).subscribe(pays => {
          if (pays.some(p => p.status === 'Pending')) {
            this.submittedPending = true;
            this.successMessage = 'Bạn đã gửi thông tin thanh toán. Đang chờ xác minh.';
            this.loading = false;
          } else {
            this.startSession();
          }
        });
      },
      error: () => { this.loading = false; }
    });
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  onQrError(event: Event): void {
    (event.target as HTMLImageElement).src = '/assets/images/default-tour.jpg';
  }

  private startSession(): void {
    this.bookingSvc.startPaymentSession(this.bookingId).subscribe({
      next: session => {
        this.loading = false;
        if (session.cancelled) {
          this.sessionCancelled = true;
          this.sessionMessage = session.message ?? '';
          return;
        }
        this.remaining = session.amountDue;
        this.remainingSeconds = session.remainingSeconds;
        this.transferNote = `${this.payConfig?.transferNotePrefix ?? 'TT'}${this.bookingId}`;
        this.startCountdown();
      },
      error: err => {
        this.loading = false;
        this.errorMsg = err.error?.message ?? err.error?.data ?? 'Không thể bắt đầu phiên thanh toán.';
      }
    });
  }

  private startCountdown(): void {
    this.clearTimer();
    this.timerId = setInterval(() => {
      if (this.remainingSeconds > 0) {
        this.remainingSeconds--;
      } else {
        this.handleExpire();
      }
    }, 1000);
  }

  private handleExpire(): void {
    this.clearTimer();
    this.sessionExpired = true;
    this.bookingSvc.expirePaymentSession(this.bookingId).subscribe({
      next: res => {
        if (res.cancelled) {
          this.sessionCancelled = true;
          this.sessionMessage = res.message ?? '';
        }
      }
    });
  }

  private clearTimer(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  submitPayment(): void {
    if (!this.booking || this.payForm.invalid || this.sessionExpired) return;
    this.payLoading = true;
    this.errorMsg = '';
    const val = this.payForm.getRawValue();

    this.paymentSvc.submit({
      bookingId: this.booking.bookingId,
      paymentMethod: 'MoMo',
      transactionCode: val.transactionCode.trim()
    }).subscribe({
      next: res => {
        this.payLoading = false;
        this.clearTimer();
        this.submittedPending = true;
        this.successMessage = res.message;
        this.emailSent = res.emailSent;
        this.emailError = res.emailError ?? '';
      },
      error: err => {
        this.payLoading = false;
        this.errorMsg = err.error?.message ?? err.error ?? 'Gửi xác nhận thất bại.';
      }
    });
  }
}
