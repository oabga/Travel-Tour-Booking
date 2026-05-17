import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-guide-booking',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page-banner page-banner-travel">
      <div class="container">
        <h1>Hướng dẫn đặt tour</h1>
        <p class="lead mb-0">Quy trình đặt tour đơn giản, nhanh chóng</p>
      </div>
    </div>

    <div class="container py-5">
      <div class="row g-4">
        <div class="col-lg-8 mx-auto">
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-body p-4">
              <h5 class="fw-bold text-primary"><span class="step-badge">1</span> Chọn tour</h5>
              <p class="text-muted mb-0">Duyệt danh mục theo vùng hoặc thời lượng trên menu Tour Du Lịch, xem chi tiết lịch khởi hành và giá.</p>
            </div>
          </div>
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-body p-4">
              <h5 class="fw-bold text-primary"><span class="step-badge">2</span> Đăng nhập và đặt chỗ</h5>
              <p class="text-muted mb-0">Đăng ký tài khoản, chọn lịch còn chỗ, nhập thông tin hành khách và mã giảm giá nếu có.</p>
            </div>
          </div>
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-body p-4">
              <h5 class="fw-bold text-primary"><span class="step-badge">3</span> Thanh toán</h5>
              <p class="text-muted mb-0">Thanh toán qua VNPay, MoMo hoặc chuyển khoản. Nhận mã booking qua email.</p>
            </div>
          </div>
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4">
              <h5 class="fw-bold text-primary"><span class="step-badge">4</span> Khởi hành</h5>
              <p class="text-muted mb-3">Xuất trình mã booking khi gặp HDV. Hotline: 1900 1234.</p>
              <a routerLink="/tours" class="btn btn-accent">Đặt tour ngay</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class GuideBookingComponent {}
