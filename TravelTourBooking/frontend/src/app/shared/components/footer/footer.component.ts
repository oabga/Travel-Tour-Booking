import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="bg-dark text-white pt-5 pb-4 mt-5">
      <div class="container">
        <div class="row g-4">
          <div class="col-lg-3 col-md-6">
            <h5 class="fw-bold mb-3"><i class="bi bi-globe-americas me-2"></i>TravelTour</h5>
            <p class="text-white-50 small">Hệ thống đặt tour du lịch trực tuyến hàng đầu. Khám phá Việt Nam và Thế giới cùng chúng tôi.</p>
            <div class="d-flex gap-2 mt-3">
              <a href="#" class="btn btn-outline-light btn-sm rounded-circle"><i class="bi bi-facebook"></i></a>
              <a href="#" class="btn btn-outline-light btn-sm rounded-circle"><i class="bi bi-youtube"></i></a>
              <a href="#" class="btn btn-outline-light btn-sm rounded-circle"><i class="bi bi-instagram"></i></a>
            </div>
          </div>
          <div class="col-lg-3 col-md-6">
            <h6 class="fw-bold mb-3">Liên kết nhanh</h6>
            <ul class="list-unstyled small">
              <li class="mb-2"><a routerLink="/tours" class="text-white-50 text-decoration-none"><i class="bi bi-chevron-right me-1"></i>Danh sách Tour</a></li>
              <li class="mb-2"><a routerLink="/about" class="text-white-50 text-decoration-none"><i class="bi bi-chevron-right me-1"></i>Giới thiệu</a></li>
              <li class="mb-2"><a routerLink="/pricing" class="text-white-50 text-decoration-none"><i class="bi bi-chevron-right me-1"></i>Bảng giá</a></li>
              <li class="mb-2"><a routerLink="/contact" class="text-white-50 text-decoration-none"><i class="bi bi-chevron-right me-1"></i>Liên hệ</a></li>
            </ul>
          </div>
          <div class="col-lg-3 col-md-6">
            <h6 class="fw-bold mb-3">Chính sách</h6>
            <ul class="list-unstyled small">
              <li class="mb-2"><a routerLink="/privacy" class="text-white-50 text-decoration-none"><i class="bi bi-chevron-right me-1"></i>Chính sách bảo mật</a></li>
              <li class="mb-2"><a routerLink="/terms" class="text-white-50 text-decoration-none"><i class="bi bi-chevron-right me-1"></i>Điều khoản chung</a></li>
              <li class="mb-2"><a routerLink="/guide-booking" class="text-white-50 text-decoration-none"><i class="bi bi-chevron-right me-1"></i>Hướng dẫn đặt tour</a></li>
              <li class="mb-2"><a routerLink="/faq" class="text-white-50 text-decoration-none"><i class="bi bi-chevron-right me-1"></i>Câu hỏi thường gặp</a></li>
            </ul>
          </div>
          <div class="col-lg-3 col-md-6">
            <h6 class="fw-bold mb-3">Liên hệ</h6>
            <ul class="list-unstyled small text-white-50">
              <li class="mb-2"><i class="bi bi-geo-alt me-2"></i>TP. Hồ Chí Minh, Việt Nam</li>
              <li class="mb-2"><i class="bi bi-telephone me-2"></i>1900 1234</li>
              <li class="mb-2"><i class="bi bi-envelope me-2"></i>contact&#64;traveltour.vn</li>
            </ul>
            <h6 class="fw-bold mt-3 mb-2 small">Thanh toán</h6>
            <div class="d-flex gap-2">
              <span class="badge bg-white text-dark px-2 py-1">VNPay</span>
              <span class="badge bg-white text-dark px-2 py-1">MoMo</span>
              <span class="badge bg-white text-dark px-2 py-1">Bank</span>
            </div>
          </div>
        </div>
        <hr class="border-secondary my-4">
        <div class="text-center text-white-50 small">
          <p class="mb-0">TravelTour &copy; {{ year }} — Đồ án môn Lập trình Cơ sở Dữ liệu</p>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
  year = new Date().getFullYear();
}
