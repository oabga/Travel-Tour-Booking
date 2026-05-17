import { Component } from '@angular/core';

@Component({
  selector: 'app-terms',
  standalone: true,
  template: `
    <div class="page-banner page-banner-travel">
      <div class="container">
        <h1>Điều khoản chung</h1>
        <p class="lead mb-0">Quy định khi sử dụng dịch vụ TravelTour</p>
      </div>
    </div>

    <div class="container py-5">
      <div class="col-lg-8 mx-auto">
        <div class="card border-0 shadow-sm">
          <div class="card-body p-4 text-muted">
            <h5 class="text-dark fw-bold">1. Đặt tour và thanh toán</h5>
            <p>Booking có hiệu lực sau khi thanh toán thành công hoặc được xác nhận bởi nhân viên. Giá tour có thể thay đổi theo mùa.</p>
            <h5 class="text-dark fw-bold mt-4">2. Hủy và hoàn tiền</h5>
            <p>Chính sách hủy tour áp dụng theo từng chương trình. Vui lòng liên hệ hotline trước ngày khởi hành ít nhất 7 ngày.</p>
            <h5 class="text-dark fw-bold mt-4">3. Trách nhiệm</h5>
            <p>Khách hàng cung cấp thông tin chính xác. TravelTour không chịu trách nhiệm cho thiệt hại do force majeure.</p>
            <h5 class="text-dark fw-bold mt-4">4. Thay đổi điều khoản</h5>
            <p class="mb-0">Chúng tôi có quyền cập nhật điều khoản; phiên bản mới được đăng trên website.</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TermsComponent {}
