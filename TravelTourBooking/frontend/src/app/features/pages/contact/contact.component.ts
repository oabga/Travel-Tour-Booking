import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-banner">
      <div class="container">
        <h1>Liên hệ</h1>
        <p class="lead mb-0">Chúng tôi luôn sẵn sàng hỗ trợ bạn</p>
      </div>
    </div>

    <div class="container py-5">
      <div class="row g-5">
        <div class="col-lg-5">
          <h3 class="fw-bold mb-4">Thông tin liên hệ</h3>

          <div class="d-flex mb-4">
            <div class="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style="width:48px;height:48px">
              <i class="bi bi-geo-alt-fill text-primary fs-5"></i>
            </div>
            <div class="ms-3">
              <h6 class="fw-bold mb-1">Địa chỉ</h6>
              <p class="text-muted mb-0">TP. Hồ Chí Minh, Việt Nam</p>
            </div>
          </div>

          <div class="d-flex mb-4">
            <div class="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style="width:48px;height:48px">
              <i class="bi bi-telephone-fill text-success fs-5"></i>
            </div>
            <div class="ms-3">
              <h6 class="fw-bold mb-1">Hotline</h6>
              <p class="text-muted mb-0">1900 1234 (Hỗ trợ 24/7)</p>
            </div>
          </div>

          <div class="d-flex mb-4">
            <div class="bg-warning bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style="width:48px;height:48px">
              <i class="bi bi-envelope-fill text-warning fs-5"></i>
            </div>
            <div class="ms-3">
              <h6 class="fw-bold mb-1">Email</h6>
              <p class="text-muted mb-0">contact&#64;traveltour.vn</p>
            </div>
          </div>

          <div class="d-flex mb-4">
            <div class="bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style="width:48px;height:48px">
              <i class="bi bi-clock-fill text-info fs-5"></i>
            </div>
            <div class="ms-3">
              <h6 class="fw-bold mb-1">Giờ làm việc</h6>
              <p class="text-muted mb-0">Thứ 2 - Chủ nhật: 8:00 - 21:00</p>
            </div>
          </div>
        </div>

        <div class="col-lg-7">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4">
              <h4 class="fw-bold mb-4">Gửi tin nhắn cho chúng tôi</h4>

              @if (submitted) {
                <div class="alert alert-success">
                  <i class="bi bi-check-circle me-2"></i>Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.
                </div>
              }

              <form [formGroup]="form" (ngSubmit)="onSubmit()">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">Họ và tên *</label>
                    <input type="text" class="form-control" formControlName="name" placeholder="Nguyễn Văn A">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Email *</label>
                    <input type="email" class="form-control" formControlName="email" placeholder="email&#64;example.com">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Số điện thoại</label>
                    <input type="tel" class="form-control" formControlName="phone" placeholder="0901 234 567">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Chủ đề</label>
                    <select class="form-select" formControlName="subject">
                      <option value="">Chọn chủ đề</option>
                      <option value="booking">Hỏi về đặt tour</option>
                      <option value="pricing">Hỏi về giá</option>
                      <option value="support">Hỗ trợ kỹ thuật</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                  <div class="col-12">
                    <label class="form-label">Nội dung *</label>
                    <textarea class="form-control" formControlName="message" rows="4" placeholder="Nhập nội dung tin nhắn..."></textarea>
                  </div>
                  <div class="col-12">
                    <button type="submit" class="btn btn-primary px-4" [disabled]="form.invalid">
                      <i class="bi bi-send me-2"></i>Gửi tin nhắn
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ContactComponent {
  submitted = false;

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    subject: [''],
    message: ['', Validators.required]
  });

  constructor(private fb: FormBuilder) {}

  onSubmit(): void {
    if (this.form.invalid) return;
    this.submitted = true;
    this.form.reset();
  }
}
