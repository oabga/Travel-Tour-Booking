import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InfoPageNavComponent } from '../../../shared/components/info-page-nav/info-page-nav.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink, InfoPageNavComponent],
  template: `
    <div class="about-page">
      <div class="page-banner page-banner-travel about-hero">
        <div class="container position-relative">
          <span class="about-hero-badge"><i class="bi bi-compass me-1"></i>TravelTour Booking</span>
          <h1>Giới thiệu</h1>
          <p class="lead mb-0">Về chúng tôi — Đồng hành cùng mọi hành trình</p>
        </div>
      </div>
      <app-info-page-nav />

      <!-- Giới thiệu chính + ảnh -->
      <section class="container py-5">
        <div class="row g-5 align-items-center">
          <div class="col-lg-6 order-lg-1 order-2">
            <span class="about-label">Câu chuyện của chúng tôi</span>
            <h2 class="about-title">Hành trình nhẹ nhàng — Trải nghiệm trọn vẹn</h2>
            <p class="text-muted about-lead">
              TravelTour là nền tảng đặt tour du lịch trực tuyến, kết nối bạn với hàng trăm hành trình
              khám phá Việt Nam và thế giới — từ biển đảo, núi rừng đến di sản văn hóa.
            </p>
            <p class="text-muted">
              Chúng tôi cam kết mang đến trải nghiệm du lịch chất lượng với giá minh bạch, lịch khởi hành
              rõ ràng và đội ngũ hướng dẫn viên giàu kinh nghiệm. Hàng ngàn khách hàng đã tin tưởng lựa chọn
              TravelTour cho kỳ nghỉ của mình.
            </p>
            <ul class="about-checklist list-unstyled mb-4">
              <li><i class="bi bi-check-circle-fill text-primary me-2"></i>Đặt tour online nhanh chóng, an toàn</li>
              <li><i class="bi bi-check-circle-fill text-primary me-2"></i>Mã giảm giá & thanh toán linh hoạt</li>
              <li><i class="bi bi-check-circle-fill text-primary me-2"></i>Hỗ trợ khách hàng 24/7</li>
            </ul>
            <div class="d-flex flex-wrap gap-2">
              <a routerLink="/tours" class="btn btn-primary px-4">
                <i class="bi bi-arrow-right me-1"></i>Khám phá Tour
              </a>
              <a routerLink="/contact" class="btn btn-outline-primary px-4">
                <i class="bi bi-chat-dots me-1"></i>Liên hệ tư vấn
              </a>
            </div>
          </div>
          <div class="col-lg-6 order-lg-2 order-1">
            <div class="about-image-frame">
              <img src="/assets/images/hero-travel.jpg" alt="Du lịch cùng TravelTour" class="about-main-img">
              <div class="about-image-badge">
                <i class="bi bi-award-fill text-warning me-2"></i>
                <div>
                  <strong>5+ năm</strong>
                  <small class="d-block text-muted">Kinh nghiệm tổ chức tour</small>
                </div>
              </div>
              <div class="about-image-float about-float-1">
                <i class="bi bi-geo-alt-fill text-primary"></i>
                <span>26+ điểm đến</span>
              </div>
              <div class="about-image-float about-float-2">
                <i class="bi bi-star-fill text-warning"></i>
                <span>4.8/5 đánh giá</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Thống kê -->
      <section class="about-stats-band">
        <div class="container">
          <div class="row g-4 text-center text-white">
            @for (s of stats; track s.label) {
              <div class="col-6 col-md-3">
                <div class="about-stat-item">
                  <i class="bi {{ s.icon }} about-stat-icon"></i>
                  <h3 class="fw-bold mb-0">{{ s.value }}</h3>
                  <p class="mb-0 opacity-90">{{ s.label }}</p>
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Sứ mệnh & Tầm nhìn -->
      <section class="container py-5">
        <div class="row g-4">
          <div class="col-md-6">
            <div class="about-mission-card h-100">
              <div class="about-mission-icon bg-primary">
                <i class="bi bi-bullseye"></i>
              </div>
              <h4 class="fw-bold">Sứ mệnh</h4>
              <p class="text-muted mb-0">
                Mang du lịch đến gần hơn với mọi người — dễ đặt, dễ đi, dễ nhớ. Chúng tôi xây dựng
                công nghệ và dịch vụ để mỗi chuyến đi đều an tâm và đáng giá.
              </p>
            </div>
          </div>
          <div class="col-md-6">
            <div class="about-mission-card h-100 about-mission-vision">
              <div class="about-mission-icon bg-success">
                <i class="bi bi-eye"></i>
              </div>
              <h4 class="fw-bold">Tầm nhìn</h4>
              <p class="text-muted mb-0">
                Trở thành nền tảng đặt tour hàng đầu Đông Nam Á, nơi khách hàng và đối tác địa phương
                cùng phát triển bền vững qua từng hành trình có trách nhiệm.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Vì sao chọn TravelTour -->
      <section class="about-why-section py-5">
        <div class="container">
          <div class="text-center mb-5">
            <span class="about-label">Lợi thế của chúng tôi</span>
            <h2 class="about-title mb-2">Vì sao chọn TravelTour?</h2>
            <p class="text-muted mx-auto" style="max-width: 560px">
              Từ khâu tư vấn đến sau chuyến đi — chúng tôi đồng hành trọn vẹn cùng bạn.
            </p>
          </div>
          <div class="row g-4">
            @for (f of features; track f.title) {
              <div class="col-md-6 col-lg-3">
                <div class="about-feature-card h-100">
                  <div class="about-feature-icon" [style.background]="f.color">
                    <i class="bi {{ f.icon }}"></i>
                  </div>
                  <h6 class="fw-bold">{{ f.title }}</h6>
                  <p class="text-muted small mb-0">{{ f.desc }}</p>
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Gallery điểm đến -->
      <section class="container pb-5">
        <div class="row g-3 align-items-end mb-4">
          <div class="col-lg-8">
            <span class="about-label">Khám phá</span>
            <h2 class="about-title mb-0">Điểm đến nổi bật</h2>
          </div>
          <div class="col-lg-4 text-lg-end">
            <a routerLink="/tours" class="btn btn-outline-primary">Xem tất cả tour <i class="bi bi-arrow-right"></i></a>
          </div>
        </div>
        <div class="row g-3">
          @for (g of gallery; track g.title) {
            <div class="col-6 col-lg-3">
              <div class="about-gallery-tile" [style.background-image]="'url(' + g.img + ')'">
                <div class="about-gallery-overlay">
                  <i class="bi {{ g.icon }}"></i>
                  <span>{{ g.title }}</span>
                </div>
              </div>
            </div>
          }
        </div>
      </section>

      <!-- Giá trị cốt lõi -->
      <section class="container pb-5">
        <div class="text-center mb-4">
          <span class="about-label">Cam kết</span>
          <h2 class="about-title">Giá trị cốt lõi</h2>
          <p class="text-muted">Những điều chúng tôi luôn giữ vững</p>
        </div>
        <div class="row g-4">
          @for (v of values; track v.title) {
            <div class="col-md-4">
              <div class="about-value-card h-100">
                <div class="about-value-icon" [class]="v.bgClass">
                  <i class="bi {{ v.icon }}"></i>
                </div>
                <h5 class="fw-bold text-center">{{ v.title }}</h5>
                <p class="text-muted text-center small mb-0">{{ v.desc }}</p>
              </div>
            </div>
          }
        </div>
      </section>

      <!-- Quy trình đặt tour -->
      <section class="about-process-section py-5">
        <div class="container">
          <div class="text-center mb-5">
            <span class="about-label text-white-50">Đơn giản & nhanh</span>
            <h2 class="fw-bold text-white mb-2">Quy trình đặt tour</h2>
            <p class="text-white-50 mb-0">Chỉ 4 bước để bắt đầu hành trình</p>
          </div>
          <div class="row g-4">
            @for (step of steps; track step.num; let i = $index) {
              <div class="col-6 col-lg-3">
                <div class="about-step-card text-center">
                  <div class="about-step-num">{{ step.num }}</div>
                  <i class="bi {{ step.icon }} about-step-icon"></i>
                  <h6 class="fw-bold text-white">{{ step.title }}</h6>
                  <p class="text-white-50 small mb-0">{{ step.desc }}</p>
                  @if (i < steps.length - 1) {
                    <i class="bi bi-chevron-right about-step-arrow d-none d-lg-block"></i>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="container py-5">
        <div class="about-cta-card text-center text-white">
          <i class="bi bi-airplane-engines display-4 mb-3 opacity-75"></i>
          <h3 class="fw-bold mb-2">Sẵn sàng cho chuyến đi tiếp theo?</h3>
          <p class="mb-4 opacity-90">Khám phá tour phù hợp hoặc liên hệ để được tư vấn miễn phí.</p>
          <a routerLink="/tours" class="btn btn-light btn-lg px-5 fw-semibold text-primary">
            <i class="bi bi-search me-2"></i>Tìm tour ngay
          </a>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .about-page { overflow-x: hidden; }

    .about-hero { padding: 3.5rem 0; text-align: center; }

    .about-hero-badge {
      display: inline-block;
      background: rgba(255, 255, 255, .2);
      border: 1px solid rgba(255, 255, 255, .35);
      padding: .35rem 1rem;
      border-radius: 50rem;
      font-size: .85rem;
      margin-bottom: 1rem;
    }

    .about-label {
      display: inline-block;
      color: var(--primary);
      font-weight: 600;
      font-size: .8rem;
      text-transform: uppercase;
      letter-spacing: .08em;
      margin-bottom: .5rem;
    }

    .about-title {
      font-weight: 700;
      font-size: clamp(1.75rem, 4vw, 2.25rem);
      margin-bottom: 1rem;
      color: var(--text-dark);
    }

    .about-lead { font-size: 1.05rem; line-height: 1.7; }

    .about-checklist li {
      padding: .35rem 0;
      color: var(--text-dark);
    }

    .about-image-frame {
      position: relative;
      border-radius: 1.25rem;
      overflow: hidden;
      box-shadow: 0 20px 50px rgba(14, 116, 144, .2);
    }

    .about-main-img {
      width: 100%;
      height: 420px;
      object-fit: cover;
      display: block;
    }

    .about-image-badge {
      position: absolute;
      bottom: 1.25rem;
      left: 1.25rem;
      background: #fff;
      padding: .75rem 1.25rem;
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      display: flex;
      align-items: center;
    }

    .about-image-float {
      position: absolute;
      background: #fff;
      padding: .5rem 1rem;
      border-radius: 50rem;
      box-shadow: var(--shadow-sm);
      font-size: .85rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: .35rem;
    }

    .about-float-1 { top: 1.25rem; right: 1rem; }
    .about-float-2 { top: 4.5rem; right: 1rem; }

    .about-stats-band {
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
      padding: 3rem 0;
    }

    .about-stat-icon { font-size: 2rem; opacity: .9; margin-bottom: .5rem; display: block; }

    .about-mission-card {
      background: #fff;
      border-radius: var(--radius);
      padding: 2rem;
      box-shadow: var(--shadow-sm);
      border: 1px solid rgba(14, 116, 144, .1);
      transition: transform .25s ease, box-shadow .25s ease;
    }

    .about-mission-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow);
    }

    .about-mission-icon {
      width: 56px;
      height: 56px;
      border-radius: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }

    .about-mission-vision { border-top: 4px solid var(--success); }
    .about-mission-card:not(.about-mission-vision) { border-top: 4px solid var(--primary); }

    .about-why-section { background: var(--bg-light); }

    .about-feature-card {
      background: #fff;
      border-radius: var(--radius);
      padding: 1.5rem;
      border: 1px solid rgba(0, 0, 0, .06);
      transition: transform .2s ease, box-shadow .2s ease;
    }

    .about-feature-card:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-sm);
    }

    .about-feature-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 1.25rem;
      margin-bottom: 1rem;
    }

    .about-gallery-tile {
      height: 200px;
      border-radius: var(--radius);
      background-size: cover;
      background-position: center;
      position: relative;
      overflow: hidden;
      transition: transform .3s ease;
    }

    .about-gallery-tile:hover { transform: scale(1.02); }

    .about-gallery-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(0, 0, 0, .75) 0%, transparent 60%);
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 1rem;
      color: #fff;
      font-weight: 600;
    }

    .about-gallery-overlay i { font-size: 1.5rem; margin-bottom: .25rem; }

    .about-value-card {
      background: #fff;
      border-radius: var(--radius);
      padding: 1.75rem;
      box-shadow: var(--shadow-sm);
      border: 1px solid rgba(0, 0, 0, .05);
    }

    .about-value-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
      font-size: 1.5rem;
    }

    .about-process-section {
      background: linear-gradient(160deg, #0c4a6e 0%, #0e7490 50%, #06b6d4 100%);
    }

    .about-step-card {
      position: relative;
      padding: 1.5rem 1rem;
    }

    .about-step-num {
      display: inline-flex;
      width: 36px;
      height: 36px;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, .2);
      border-radius: 50%;
      font-weight: 700;
      color: #fff;
      margin-bottom: .75rem;
    }

    .about-step-icon { font-size: 2rem; color: #fff; display: block; margin-bottom: .5rem; }

    .about-step-arrow {
      position: absolute;
      right: -.75rem;
      top: 50%;
      transform: translateY(-50%);
      font-size: 1.5rem;
      color: rgba(255, 255, 255, .4);
    }

    .about-cta-card {
      background: linear-gradient(135deg, var(--primary) 0%, #06b6d4 100%);
      border-radius: 1.25rem;
      padding: 3rem 2rem;
      box-shadow: 0 16px 40px rgba(14, 116, 144, .25);
    }

    @media (max-width: 991px) {
      .about-main-img { height: 300px; }
      .about-image-float { display: none; }
    }
  `]
})
export class AboutComponent {
  stats = [
    { icon: 'bi-map', value: '48+', label: 'Tour đa dạng' },
    { icon: 'bi-people', value: '10,000+', label: 'Khách hàng tin tưởng' },
    { icon: 'bi-geo-alt', value: '26+', label: 'Điểm đến' },
    { icon: 'bi-award', value: '5+', label: 'Năm kinh nghiệm' }
  ];

  features = [
    { icon: 'bi-shield-check', title: 'Đặt tour an toàn', desc: 'Xác nhận nhanh, bảo mật thông tin thanh toán.', color: 'linear-gradient(135deg, #0e7490, #06b6d4)' },
    { icon: 'bi-tag', title: 'Ưu đãi hấp dẫn', desc: 'Mã giảm giá theo mùa, giá tour minh bạch.', color: 'linear-gradient(135deg, #059669, #34d399)' },
    { icon: 'bi-person-badge', title: 'HDV chuyên nghiệp', desc: 'Hướng dẫn viên được tuyển chọn kỹ lưỡng.', color: 'linear-gradient(135deg, #d97706, #fbbf24)' },
    { icon: 'bi-headset', title: 'Hỗ trợ 24/7', desc: 'Tư vấn trước, trong và sau chuyến đi.', color: 'linear-gradient(135deg, #7c3aed, #a78bfa)' }
  ];

  gallery = [
    { title: 'Biển đảo', icon: 'bi-water', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80' },
    { title: 'Núi rừng', icon: 'bi-tree', img: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=80' },
    { title: 'Di sản', icon: 'bi-bank', img: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&q=80' },
    { title: 'Phố cổ', icon: 'bi-house-heart', img: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=600&q=80' }
  ];

  values = [
    { icon: 'bi-shield-check', title: 'Uy tín hàng đầu', desc: 'Cam kết chất lượng dịch vụ và bảo vệ quyền lợi khách hàng.', bgClass: 'bg-primary bg-opacity-10 text-primary' },
    { icon: 'bi-wallet2', title: 'Giá minh bạch', desc: 'Giá tour rõ ràng, không phí ẩn. Nhiều hình thức thanh toán.', bgClass: 'bg-success bg-opacity-10 text-success' },
    { icon: 'bi-heart', title: 'Tận tâm phục vụ', desc: 'Lắng nghe và đồng hành để mỗi chuyến đi trọn vẹn.', bgClass: 'bg-danger bg-opacity-10 text-danger' }
  ];

  steps = [
    { num: '1', icon: 'bi-search', title: 'Chọn tour', desc: 'Lọc theo điểm đến, giá, thời gian.' },
    { num: '2', icon: 'bi-calendar-check', title: 'Đặt chỗ', desc: 'Điền thông tin & áp mã giảm giá.' },
    { num: '3', icon: 'bi-credit-card', title: 'Thanh toán', desc: 'Chuyển khoản hoặc ví điện tử.' },
    { num: '4', icon: 'bi-emoji-smile', title: 'Khởi hành', desc: 'Nhận xác nhận qua email & đi thôi!' }
  ];
}
