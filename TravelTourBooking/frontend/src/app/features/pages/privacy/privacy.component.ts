import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InfoPageNavComponent } from '../../../shared/components/info-page-nav/info-page-nav.component';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule, RouterLink, InfoPageNavComponent],
  template: `
    <div class="info-page">
      <div class="page-banner page-banner-travel">
        <div class="container text-center">
          <span class="info-hero-badge"><i class="bi bi-shield-lock me-1"></i>Bảo mật</span>
          <h1>Chính sách bảo mật</h1>
          <p class="lead mb-0">Cam kết bảo vệ thông tin cá nhân của bạn</p>
          <p class="small mt-2 opacity-75 mb-0">Cập nhật lần cuối: Tháng 5/2026</p>
        </div>
      </div>
      <app-info-page-nav />

      <section class="container py-5">
        <div class="row g-5">
          <div class="col-lg-3 d-none d-lg-block">
            <nav class="info-toc">
              <p class="fw-bold small text-uppercase text-muted mb-2">Mục lục</p>
              @for (s of sections; track s.id) {
                <a [href]="'#' + s.id">{{ s.title }}</a>
              }
            </nav>
          </div>
          <div class="col-lg-9">
            <div class="row g-4 mb-4">
              <div class="col-md-4">
                <div class="info-img-frame" style="height: 140px">
                  <img src="https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&q=80" alt="Bảo mật dữ liệu">
                </div>
              </div>
              <div class="col-md-8">
                <p class="text-muted mb-0">
                  TravelTour ("chúng tôi") tôn trọng quyền riêng tư của bạn. Chính sách này mô tả cách chúng tôi
                  thu thập, sử dụng, lưu trữ và bảo vệ thông tin khi bạn sử dụng website đặt tour, ứng dụng
                  và các kênh liên hệ chính thức của TravelTour Booking.
                </p>
              </div>
            </div>

            <div class="info-card p-4 p-lg-5">
              @for (s of sections; track s.id) {
                <article [id]="s.id" class="info-policy-section">
                  <div class="d-flex gap-3 mb-3">
                    <div class="info-card-icon" [class]="s.iconClass">
                      <i class="bi {{ s.icon }}"></i>
                    </div>
                    <div>
                      <h4 class="fw-bold mb-2">{{ s.title }}</h4>
                      @for (p of s.paragraphs; track p) {
                        <p class="text-muted">{{ p }}</p>
                      }
                      @if (s.list) {
                        <ul class="text-muted">
                          @for (item of s.list; track item) {
                            <li>{{ item }}</li>
                          }
                        </ul>
                      }
                    </div>
                  </div>
                </article>
              }
            </div>

            <div class="info-cta-strip mt-5">
              <h5 class="fw-bold mb-2">Yêu cầu xóa hoặc chỉnh sửa dữ liệu?</h5>
              <p class="mb-3 opacity-90 small">Gửi email kèm thông tin tài khoản đến contact&#64;traveltour.vn — phản hồi trong 7 ngày làm việc.</p>
              <a routerLink="/contact" class="btn btn-light btn-sm text-primary fw-semibold">Liên hệ</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  `
})
export class PrivacyComponent {
  sections = [
    {
      id: 'collect',
      title: '1. Thông tin chúng tôi thu thập',
      icon: 'bi-database',
      iconClass: 'bg-primary bg-opacity-10 text-primary',
      paragraphs: [
        'Khi bạn đăng ký tài khoản, đặt tour hoặc liên hệ hỗ trợ, chúng tôi có thể thu thập: họ tên, email, số điện thoại, địa chỉ, thông tin hành khách (CMND/hộ chiếu nếu tour yêu cầu), lịch sử đặt tour và giao dịch thanh toán.',
        'Dữ liệu kỹ thuật: địa chỉ IP, loại trình duyệt, cookie phiên đăng nhập và nhật ký truy cập nhằm bảo mật hệ thống.'
      ],
      list: [
        'Thông tin tài khoản: email, mật khẩu (đã mã hóa), vai trò người dùng.',
        'Thông tin booking: mã tour, ngày khởi hành, số khách, mã voucher.',
        'Thông tin thanh toán: mã giao dịch, số tiền — không lưu số thẻ đầy đủ trên server TravelTour.'
      ]
    },
    {
      id: 'use',
      title: '2. Mục đích sử dụng',
      icon: 'bi-gear',
      iconClass: 'bg-success bg-opacity-10 text-success',
      paragraphs: [
        'Thông tin được dùng để xử lý đặt tour, gửi xác nhận qua email, liên hệ khi có thay đổi lịch, hỗ trợ khách hàng và cải thiện trải nghiệm website.',
        'Chúng tôi có thể gửi thông báo khuyến mãi nếu bạn đồng ý nhận tin; bạn có thể hủy đăng ký bất cứ lúc nào.'
      ],
      list: [
        'Xác minh danh tính và ngăn gian lận đặt chỗ.',
        'Thống kê nội bộ (ẩn danh) về tour được xem nhiều nhất.',
        'Tuân thủ yêu cầu pháp luật khi có cơ quan có thẩm quyền yêu cầu.'
      ]
    },
    {
      id: 'share',
      title: '3. Chia sẻ với bên thứ ba',
      icon: 'bi-share',
      iconClass: 'bg-warning bg-opacity-10 text-warning',
      paragraphs: [
        'TravelTour không bán dữ liệu cá nhân. Chúng tôi chỉ chia sẻ thông tin cần thiết với đối tác vận hành tour (HDV, khách sạn, nhà xe) để thực hiện chuyến đi bạn đã đặt.',
        'Cổng thanh toán (VNPay, MoMo, ngân hàng) xử lý giao dịch theo chính sách riêng của họ.'
      ]
    },
    {
      id: 'security',
      title: '4. Bảo mật & lưu trữ',
      icon: 'bi-lock',
      iconClass: 'bg-danger bg-opacity-10 text-danger',
      paragraphs: [
        'Mật khẩu được băm (hash) trước khi lưu. Kết nối website sử dụng HTTPS. Quyền truy cập dữ liệu nội bộ được phân theo vai trò (admin, nhân viên, khách hàng).',
        'Dữ liệu được lưu trên máy chủ bảo mật; sao lưu định kỳ. Thời gian lưu booking và hóa đơn theo quy định kế toán Việt Nam (tối thiểu theo luật hiện hành).'
      ]
    },
    {
      id: 'cookies',
      title: '5. Cookie & công nghệ theo dõi',
      icon: 'bi-cookie',
      iconClass: 'bg-info bg-opacity-10 text-info',
      paragraphs: [
        'Cookie phiên giúp duy trì đăng nhập và giỏ đặt tour. Cookie phân tích (nếu bật) giúp chúng tôi hiểu cách người dùng sử dụng trang để cải thiện giao diện.',
        'Bạn có thể tắt cookie trên trình duyệt; một số tính năng (đăng nhập, thanh toán) có thể không hoạt động đầy đủ.'
      ]
    },
    {
      id: 'rights',
      title: '6. Quyền của bạn',
      icon: 'bi-person-check',
      iconClass: 'bg-primary bg-opacity-10 text-primary',
      paragraphs: [
        'Bạn có quyền yêu cầu truy cập, chỉnh sửa hoặc xóa dữ liệu cá nhân (trừ dữ liệu bắt buộc lưu theo pháp luật).',
        'Bạn có quyền khiếu nại nếu cho rằng dữ liệu bị xử lý trái chính sách này.'
      ],
      list: [
        'Rút lại sự đồng ý nhận email marketing.',
        'Yêu cầu xuất bản sao dữ liệu booking của tài khoản.',
        'Đóng tài khoản — liên hệ support&#64;traveltour.vn.'
      ]
    },
    {
      id: 'children',
      title: '7. Trẻ em',
      icon: 'bi-people',
      iconClass: 'bg-success bg-opacity-10 text-success',
      paragraphs: [
        'Dịch vụ không hướng tới trẻ em dưới 16 tuổi tự đăng ký. Phụ huynh đặt tour cho trẻ em cần cung cấp thông tin hợp lệ và chịu trách nhiệm giám sát.'
      ]
    },
    {
      id: 'changes',
      title: '8. Thay đổi chính sách',
      icon: 'bi-arrow-repeat',
      iconClass: 'bg-secondary bg-opacity-10 text-secondary',
      paragraphs: [
        'Chúng tôi có thể cập nhật chính sách; phiên bản mới được đăng trên trang này kèm ngày hiệu lực. Việc tiếp tục sử dụng dịch vụ sau khi cập nhật đồng nghĩa bạn chấp nhận thay đổi.'
      ]
    },
    {
      id: 'contact',
      title: '9. Liên hệ',
      icon: 'bi-envelope',
      iconClass: 'bg-primary bg-opacity-10 text-primary',
      paragraphs: [
        'Mọi thắc mắc về bảo mật: contact&#64;traveltour.vn | Hotline: 1900 1234 | Địa chỉ: TP. Hồ Chí Minh, Việt Nam.'
      ]
    }
  ];
}
