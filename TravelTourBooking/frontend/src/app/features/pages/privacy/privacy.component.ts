import { Component } from '@angular/core';

@Component({
  selector: 'app-privacy',
  standalone: true,
  template: `
    <div class="page-banner page-banner-travel">
      <div class="container">
        <h1>Chính sách bảo mật</h1>
        <p class="lead mb-0">Cam kết bảo vệ thông tin cá nhân của bạn</p>
      </div>
    </div>

    <div class="container py-5">
      <div class="col-lg-8 mx-auto">
        <div class="card border-0 shadow-sm">
          <div class="card-body p-4 text-muted">
            <h5 class="text-dark fw-bold">1. Thu thập thông tin</h5>
            <p>Chúng tôi thu thập họ tên, email, số điện thoại và thông tin hành khách khi bạn đặt tour để xử lý booking và liên hệ hỗ trợ.</p>
            <h5 class="text-dark fw-bold mt-4">2. Sử dụng thông tin</h5>
            <p>Thông tin chỉ dùng cho mục đích đặt tour, thanh toán, gửi xác nhận và cải thiện dịch vụ. Không bán cho bên thứ ba.</p>
            <h5 class="text-dark fw-bold mt-4">3. Bảo mật</h5>
            <p>Mật khẩu được mã hóa. Giao dịch thanh toán qua cổng bảo mật VNPay/MoMo.</p>
            <h5 class="text-dark fw-bold mt-4">4. Liên hệ</h5>
            <p class="mb-0">Mọi yêu cầu về dữ liệu cá nhân: contact&#64;traveltour.vn hoặc hotline 1900 1234.</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PrivacyComponent {}
