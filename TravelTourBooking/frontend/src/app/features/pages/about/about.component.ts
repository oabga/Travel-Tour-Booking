import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-banner page-banner-travel">
      <div class="container">
        <h1>Giới thiệu</h1>
        <p class="lead mb-0">Về chúng tôi — TravelTour</p>
      </div>
    </div>

    <div class="container py-5">
      <div class="row g-5 align-items-center mb-5">
        <div class="col-lg-6">
          <h2 class="fw-bold mb-3">Hành trình nhẹ nhàng — Trải nghiệm trọn vẹn</h2>
          <p class="text-muted">TravelTour là hệ thống đặt tour du lịch trực tuyến, kết nối bạn với những hành trình khám phá Việt Nam và Thế giới. Chúng tôi cam kết mang đến trải nghiệm du lịch chất lượng với giá cả hợp lý nhất.</p>
          <p class="text-muted">Với đội ngũ hướng dẫn viên giàu kinh nghiệm và mạng lưới đối tác rộng khắp, chúng tôi tự hào phục vụ hàng ngàn du khách mỗi năm.</p>
          <a routerLink="/tours" class="btn btn-primary mt-2">
            <i class="bi bi-arrow-right me-1"></i>Khám phá Tour
          </a>
        </div>
        <div class="col-lg-6">
          <div class="bg-primary bg-opacity-10 rounded-4 p-5 text-center">
            <i class="bi bi-globe-americas display-1 text-primary"></i>
          </div>
        </div>
      </div>

      <div class="row g-4 mb-5">
        <div class="col-md-3 col-6">
          <div class="card border-0 shadow-sm text-center p-4">
            <i class="bi bi-map fs-1 text-primary mb-2"></i>
            <h3 class="fw-bold">50+</h3>
            <p class="text-muted mb-0">Tour đa dạng</p>
          </div>
        </div>
        <div class="col-md-3 col-6">
          <div class="card border-0 shadow-sm text-center p-4">
            <i class="bi bi-people fs-1 text-success mb-2"></i>
            <h3 class="fw-bold">10,000+</h3>
            <p class="text-muted mb-0">Khách hàng hài lòng</p>
          </div>
        </div>
        <div class="col-md-3 col-6">
          <div class="card border-0 shadow-sm text-center p-4">
            <i class="bi bi-geo-alt fs-1 text-danger mb-2"></i>
            <h3 class="fw-bold">20+</h3>
            <p class="text-muted mb-0">Điểm đến hấp dẫn</p>
          </div>
        </div>
        <div class="col-md-3 col-6">
          <div class="card border-0 shadow-sm text-center p-4">
            <i class="bi bi-award fs-1 text-warning mb-2"></i>
            <h3 class="fw-bold">5+</h3>
            <p class="text-muted mb-0">Năm kinh nghiệm</p>
          </div>
        </div>
      </div>

      <div class="text-center mb-4">
        <h2 class="fw-bold">Giá trị cốt lõi</h2>
        <p class="text-muted">Những cam kết của chúng tôi</p>
      </div>
      <div class="row g-4">
        <div class="col-md-4">
          <div class="card border-0 shadow-sm h-100 p-4">
            <div class="text-center mb-3">
              <div class="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center" style="width:64px;height:64px">
                <i class="bi bi-shield-check fs-3 text-primary"></i>
              </div>
            </div>
            <h5 class="text-center fw-bold">Uy tín hàng đầu</h5>
            <p class="text-muted text-center mb-0">Cam kết chất lượng dịch vụ và bảo vệ quyền lợi khách hàng là ưu tiên số 1 của chúng tôi.</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border-0 shadow-sm h-100 p-4">
            <div class="text-center mb-3">
              <div class="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center" style="width:64px;height:64px">
                <i class="bi bi-wallet2 fs-3 text-success"></i>
              </div>
            </div>
            <h5 class="text-center fw-bold">Giá cả minh bạch</h5>
            <p class="text-muted text-center mb-0">Giá tour rõ ràng, không phát sinh chi phí ẩn. Hỗ trợ nhiều hình thức thanh toán.</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border-0 shadow-sm h-100 p-4">
            <div class="text-center mb-3">
              <div class="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center" style="width:64px;height:64px">
                <i class="bi bi-headset fs-3 text-warning"></i>
              </div>
            </div>
            <h5 class="text-center fw-bold">Hỗ trợ 24/7</h5>
            <p class="text-muted text-center mb-0">Đội ngũ tư vấn viên luôn sẵn sàng hỗ trợ bạn mọi lúc, mọi nơi.</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AboutComponent {}
