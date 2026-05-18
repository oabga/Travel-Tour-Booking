import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InfoPageNavComponent } from '../../../shared/components/info-page-nav/info-page-nav.component';

@Component({
  selector: 'app-guide-booking',
  standalone: true,
  imports: [CommonModule, RouterLink, InfoPageNavComponent],
  template: `
    <div class="info-page">
      <div class="page-banner page-banner-travel">
        <div class="container text-center">
          <span class="info-hero-badge"><i class="bi bi-journal-check me-1"></i>Hướng dẫn</span>
          <h1>Hướng dẫn đặt tour</h1>
          <p class="lead mb-0">Từ chọn tour đến khởi hành — chỉ vài bước đơn giản</p>
        </div>
      </div>
      <app-info-page-nav />

      <!-- Tổng quan -->
      <section class="container py-5">
        <div class="row g-5 align-items-center">
          <div class="col-lg-6">
            <span class="info-label">Bắt đầu nhanh</span>
            <h2 class="info-title">Đặt tour trực tuyến dễ dàng</h2>
            <p class="text-muted">
              TravelTour giúp bạn so sánh lịch khởi hành, giá và chương trình tour ngay trên website.
              Không cần đến văn phòng — chỉ cần tài khoản, thẻ ngân hàng hoặc ví điện tử để hoàn tất đặt chỗ.
            </p>
            <p class="text-muted">
              Sau khi thanh toán thành công, hệ thống gửi email xác nhận kèm mã booking. Bạn mang mã này
              (hoặc in voucher) khi gặp hướng dẫn viên tại điểm tập trung.
            </p>
            <div class="d-flex flex-wrap gap-2 mt-3">
              <a routerLink="/tours" class="btn btn-primary"><i class="bi bi-search me-1"></i>Tìm tour</a>
              <a routerLink="/register" class="btn btn-outline-primary"><i class="bi bi-person-plus me-1"></i>Đăng ký</a>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="info-img-frame" style="height: 340px">
              <img src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80" alt="Lên kế hoạch du lịch">
            </div>
          </div>
        </div>
      </section>

      <!-- 4 bước chi tiết -->
      <section class="info-section-alt py-5">
        <div class="container">
          <div class="text-center mb-5">
            <span class="info-label">Quy trình</span>
            <h2 class="info-title mb-2">4 bước đặt tour</h2>
            <p class="text-muted mx-auto" style="max-width: 520px">Làm theo từng bước dưới đây để đảm bảo booking hợp lệ.</p>
          </div>
          @for (step of steps; track step.num; let i = $index) {
            <div class="row g-4 align-items-center mb-5" [class.flex-lg-row-reverse]="i % 2 === 1">
              <div class="col-lg-6">
                <div class="info-card p-4 h-100">
                  <div class="d-flex align-items-start gap-3">
                    <span class="step-badge flex-shrink-0" style="width:40px;height:40px;font-size:1rem">{{ step.num }}</span>
                    <div>
                      <h4 class="fw-bold text-primary mb-2">{{ step.title }}</h4>
                      <p class="text-muted mb-3">{{ step.desc }}</p>
                      <ul class="list-unstyled mb-0 small text-muted">
                        @for (tip of step.tips; track tip) {
                          <li class="mb-2"><i class="bi bi-check2 text-success me-2"></i>{{ tip }}</li>
                        }
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-lg-6">
                <div class="info-img-tile" [style.background-image]="'url(' + step.img + ')'" style="height: 260px">
                  <div class="position-absolute bottom-0 start-0 p-3 text-white fw-semibold z-1">
                    <i class="bi {{ step.icon }} me-2"></i>{{ step.title }}
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      </section>

      <!-- Thanh toán & voucher -->
      <section class="container py-5">
        <div class="row g-5">
          <div class="col-lg-6">
            <span class="info-label">Thanh toán</span>
            <h3 class="fw-bold mb-3">Hình thức thanh toán</h3>
            <div class="row g-3">
              @for (pay of payments; track pay.name) {
                <div class="col-sm-6">
                  <div class="info-card p-3 h-100 d-flex align-items-center gap-3">
                    <div class="info-card-icon bg-primary bg-opacity-10 text-primary">
                      <i class="bi {{ pay.icon }}"></i>
                    </div>
                    <div>
                      <h6 class="fw-bold mb-0">{{ pay.name }}</h6>
                      <small class="text-muted">{{ pay.desc }}</small>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
          <div class="col-lg-6">
            <span class="info-label">Tiết kiệm</span>
            <h3 class="fw-bold mb-3">Sử dụng mã giảm giá</h3>
            <div class="info-card p-4">
              <p class="text-muted">
                Khi đặt tour, nhập mã voucher (ví dụ <code>HE2024</code>, <code>SUMMER15</code>) vào ô
                <strong>Mã giảm giá</strong> rồi bấm <strong>Áp dụng</strong>. Hệ thống tự tính lại tổng tiền.
              </p>
              <ul class="text-muted small mb-0">
                <li>Mỗi mã có điều kiện giá tối thiểu và hạn sử dụng riêng.</li>
                <li>Một booking thường chỉ áp dụng một mã.</li>
                <li>Cần đăng nhập trước khi đặt tour để áp dụng voucher.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- Lưu ý -->
      <section class="info-section-alt py-5">
        <div class="container">
          <div class="text-center mb-4">
            <span class="info-label">Quan trọng</span>
            <h2 class="info-title">Lưu ý trước khi đi</h2>
          </div>
          <div class="row g-4">
            @for (note of notes; track note.title) {
              <div class="col-md-6 col-lg-4">
                <div class="info-card p-4 h-100 text-center">
                  <div class="info-card-icon bg-warning bg-opacity-10 text-warning mx-auto mb-3">
                    <i class="bi {{ note.icon }}"></i>
                  </div>
                  <h6 class="fw-bold">{{ note.title }}</h6>
                  <p class="text-muted small mb-0">{{ note.desc }}</p>
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="container pb-5">
        <div class="info-cta-strip">
          <h3 class="fw-bold mb-2">Cần hỗ trợ đặt tour?</h3>
          <p class="mb-4 opacity-90">Hotline 1900 1234 — hoặc xem thêm câu hỏi thường gặp.</p>
          <a routerLink="/faq" class="btn btn-light text-primary fw-semibold me-2">Xem FAQ</a>
          <a routerLink="/contact" class="btn btn-outline-light">Liên hệ</a>
        </div>
      </section>
    </div>
  `
})
export class GuideBookingComponent {
  steps = [
    {
      num: '1',
      title: 'Chọn tour phù hợp',
      icon: 'bi-compass',
      img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
      desc: 'Duyệt menu Tour Du Lịch theo danh mục (Adventure, Luxury, Family, Beach) hoặc tìm theo điểm đến. Mở trang chi tiết để xem lịch trình, giá, số chỗ còn lại và đánh giá.',
      tips: [
        'So sánh nhiều ngày khởi hành — giá có thể khác theo mùa.',
        'Đọc kỹ điều kiện tour: độ tuổi, hành lý, mức độ vận động.',
        'Lưu tour yêu thích bằng cách ghi nhớ mã tour.'
      ]
    },
    {
      num: '2',
      title: 'Đăng nhập & điền thông tin',
      icon: 'bi-person-check',
      img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80',
      desc: 'Bạn cần tài khoản TravelTour để đặt chỗ. Chọn lịch khởi hành còn chỗ, nhập số lượng khách và thông tin liên hệ (họ tên, email, SĐT).',
      tips: [
        'Kiểm tra email/SĐT chính xác — dùng nhận xác nhận booking.',
        'Nhập đủ thông tin hành khách theo yêu cầu tour.',
        'Áp dụng mã giảm giá trước khi chuyển sang thanh toán.'
      ]
    },
    {
      num: '3',
      title: 'Thanh toán an toàn',
      icon: 'bi-credit-card',
      img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
      desc: 'Chọn phương thức thanh toán: chuyển khoản ngân hàng, quét QR MoMo hoặc cổng VNPay. Booking chỉ được xác nhận khi thanh toán thành công hoặc được nhân viên duyệt.',
      tips: [
        'Giữ biên lai / ảnh chụp màn hình giao dịch.',
        'Kiểm tra email xác nhận trong vòng 15 phút.',
        'Liên hệ hotline nếu chưa nhận được mã booking.'
      ]
    },
    {
      num: '4',
      title: 'Khởi hành & trải nghiệm',
      icon: 'bi-airplane',
      img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
      desc: 'Đến điểm tập trung đúng giờ, xuất trình mã booking hoặc email xác nhận cho HDV. Tuân thủ quy định an toàn và lịch trình của đoàn.',
      tips: [
        'Mang CMND/CCCD hoặc hộ chiếu (tour nước ngoài).',
        'Chuẩn bị vật dụng theo gợi ý trong email hướng dẫn.',
        'Đánh giá tour sau chuyến đi để nhận ưu đãi lần sau.'
      ]
    }
  ];

  payments = [
    { icon: 'bi-bank', name: 'Chuyển khoản', desc: 'Quét QR hoặc chuyển theo thông tin trên trang thanh toán.' },
    { icon: 'bi-phone', name: 'MoMo', desc: 'Quét mã QR MoMo, nhập nội dung chuyển khoản đúng mã booking.' },
    { icon: 'bi-wallet2', name: 'VNPay', desc: 'Thanh toán qua cổng VNPay (thẻ nội địa/quốc tế).' },
    { icon: 'bi-cash-stack', name: 'Tại văn phòng', desc: 'Liên hệ hotline để đặt cọc và xác nhận thủ công.' }
  ];

  notes = [
    { icon: 'bi-clock', title: 'Giờ tập trung', desc: 'Có mặt trước 15–30 phút so với giờ khởi hành ghi trên voucher.' },
    { icon: 'bi-x-circle', title: 'Hủy tour', desc: 'Chính sách hủy khác nhau theo từng tour — xem Điều khoản chung.' },
    { icon: 'bi-shield-check', title: 'Bảo hiểm', desc: 'Một số tour đã bao gồm bảo hiểm — chi tiết trong mô tả tour.' },
    { icon: 'bi-telephone', title: 'Hotline', desc: '1900 1234 hỗ trợ 24/7 trước và trong suốt chuyến đi.' },
    { icon: 'bi-cloud-rain', title: 'Thời tiết', desc: 'Tour có thể điều chỉnh lịch do thời tiết bất khả kháng.' },
    { icon: 'bi-passport', title: 'Giấy tờ', desc: 'Tour biên giới cần hộ chiếu còn hạn theo quy định.' }
  ];
}
