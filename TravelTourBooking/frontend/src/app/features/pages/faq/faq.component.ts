import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InfoPageNavComponent } from '../../../shared/components/info-page-nav/info-page-nav.component';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  link?: { path: string; text: string };
}

interface FaqCategory {
  name: string;
  icon: string;
  items: FaqItem[];
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, RouterLink, InfoPageNavComponent],
  template: `
    <div class="info-page">
      <div class="page-banner page-banner-travel">
        <div class="container text-center">
          <span class="info-hero-badge"><i class="bi bi-question-circle me-1"></i>Hỗ trợ</span>
          <h1>Câu hỏi thường gặp</h1>
          <p class="lead mb-0">Giải đáp thắc mắc về đặt tour, thanh toán và chính sách</p>
        </div>
      </div>
      <app-info-page-nav />

      <!-- Hero tìm kiếm nhanh -->
      <section class="container py-4">
        <div class="row g-4 align-items-center">
          <div class="col-lg-7">
            <div class="info-card p-4">
              <h5 class="fw-bold mb-3"><i class="bi bi-lightning-charge text-warning me-2"></i>Trả lời nhanh</h5>
              <div class="row g-2">
                @for (quick of quickLinks; track quick.label) {
                  <div class="col-sm-6">
                    <a [routerLink]="quick.path" class="btn btn-outline-primary btn-sm w-100 text-start">
                      <i class="bi {{ quick.icon }} me-2"></i>{{ quick.label }}
                    </a>
                  </div>
                }
              </div>
            </div>
          </div>
          <div class="col-lg-5">
            <div class="info-img-frame" style="height: 200px">
              <img src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=700&q=80" alt="Hỗ trợ khách hàng">
            </div>
          </div>
        </div>
      </section>

      <!-- FAQ theo danh mục -->
      <section class="container pb-5">
        @for (cat of categories; track cat.name; let ci = $index) {
          <div class="mb-5">
            <p class="info-faq-category"><i class="bi {{ cat.icon }} me-1"></i>{{ cat.name }}</p>
            <div class="accordion" [id]="'faqCat' + ci">
              @for (item of cat.items; track item.id; let ii = $index) {
                <div class="accordion-item border-0 shadow-sm mb-2 rounded overflow-hidden">
                  <h2 class="accordion-header">
                    <button
                      class="accordion-button"
                      [class.collapsed]="!(ci === 0 && ii === 0)"
                      type="button"
                      data-bs-toggle="collapse"
                      [attr.data-bs-target]="'#' + item.id"
                      [attr.aria-expanded]="ci === 0 && ii === 0">
                      {{ item.question }}
                    </button>
                  </h2>
                  <div
                    [id]="item.id"
                    class="accordion-collapse collapse"
                    [class.show]="ci === 0 && ii === 0"
                    [attr.data-bs-parent]="'#faqCat' + ci">
                    <div class="accordion-body text-muted">
                      {{ item.answer }}
                      @if (item.link) {
                        <a [routerLink]="item.link.path" class="ms-1">{{ item.link.text }}</a>
                      }
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <div class="info-cta-strip mt-4">
          <h4 class="fw-bold mb-2">Không tìm thấy câu trả lời?</h4>
          <p class="mb-3 opacity-90">Đội ngũ tư vấn sẵn sàng hỗ trợ — Hotline <strong>1900 1234</strong></p>
          <a routerLink="/contact" class="btn btn-light text-primary fw-semibold me-2">Gửi tin nhắn</a>
          <a routerLink="/guide-booking" class="btn btn-outline-light">Hướng dẫn đặt tour</a>
        </div>
      </section>
    </div>
  `
})
export class FaqComponent {
  quickLinks = [
    { label: 'Cách đặt tour', path: '/guide-booking', icon: 'bi-journal-check' },
    { label: 'Chính sách hủy', path: '/terms', icon: 'bi-file-text' },
    { label: 'Bảo mật dữ liệu', path: '/privacy', icon: 'bi-shield-lock' },
    { label: 'Liên hệ', path: '/contact', icon: 'bi-envelope' }
  ];

  categories: FaqCategory[] = [
    {
      name: 'Đặt tour & tài khoản',
      icon: 'bi-calendar-check',
      items: [
        {
          id: 'faq-a1',
          question: 'Làm sao để đặt tour trên TravelTour?',
          answer: 'Chọn tour trên menu Tour Du Lịch, xem chi tiết lịch khởi hành còn chỗ, đăng nhập, điền thông tin hành khách và thanh toán. Sau khi thành công bạn nhận email xác nhận kèm mã booking.',
          link: { path: '/guide-booking', text: 'Xem hướng dẫn chi tiết →' }
        },
        {
          id: 'faq-a2',
          question: 'Tôi có cần đăng ký tài khoản không?',
          answer: 'Có. Tài khoản giúp quản lý booking, áp dụng mã giảm giá và xem lịch sử đặt tour. Đăng ký miễn phí bằng email và mật khẩu.'
        },
        {
          id: 'faq-a3',
          question: 'Có thể đặt tour cho người khác không?',
          answer: 'Có. Khi đặt, nhập thông tin liên hệ của bạn và danh sách hành khách thực tế đi tour. Người liên hệ sẽ nhận email xác nhận.'
        },
        {
          id: 'faq-a4',
          question: 'Làm sao biết tour còn chỗ?',
          answer: 'Trên trang chi tiết tour, mục Lịch khởi hành hiển thị số chỗ còn lại theo từng ngày. Hết chỗ sẽ không cho chọn ngày đó.'
        },
        {
          id: 'faq-a5',
          question: 'Quên mật khẩu thì làm gì?',
          answer: 'Tại trang Đăng nhập, chọn "Quên mật khẩu" (nếu đã bật) hoặc liên hệ hotline 1900 1234 / support&#64;traveltour.vn để được hỗ trợ đặt lại.'
        }
      ]
    },
    {
      name: 'Thanh toán & voucher',
      icon: 'bi-credit-card',
      items: [
        {
          id: 'faq-b1',
          question: 'Các hình thức thanh toán được chấp nhận?',
          answer: 'Chuyển khoản ngân hàng (QR), ví MoMo và cổng VNPay. Một số tour cho phép đặt cọc tại văn phòng — liên hệ hotline.'
        },
        {
          id: 'faq-b2',
          question: 'Sau thanh toán bao lâu nhận được xác nhận?',
          answer: 'Thường trong 5–15 phút qua email. Chuyển khoản thủ công có thể cần nhân viên xác nhận trong giờ hành chính.'
        },
        {
          id: 'faq-b3',
          question: 'Mã giảm giá (voucher) lấy ở đâu?',
          answer: 'Mã do TravelTour phát hành qua chiến dịch, email khuyến mãi hoặc admin. Nhập mã khi đặt tour và bấm Áp dụng. Mỗi mã có điều kiện giá tối thiểu và hạn dùng riêng.'
        },
        {
          id: 'faq-b4',
          question: 'Vì sao mã giảm giá không áp dụng được?',
          answer: 'Có thể do hết hạn, đã dùng hết lượt, giá tour chưa đạt mức tối thiểu, hoặc mã không áp dụng cho tour/danh mục đó. Kiểm tra lại điều kiện hoặc liên hệ hỗ trợ.'
        },
        {
          id: 'faq-b5',
          question: 'Có xuất hóa đơn VAT không?',
          answer: 'Có, với doanh nghiệp. Gửi yêu cầu kèm mã booking và thông tin công ty trong vòng 7 ngày sau khi thanh toán qua contact&#64;traveltour.vn.'
        }
      ]
    },
    {
      name: 'Hủy tour & hoàn tiền',
      icon: 'bi-arrow-counterclockwise',
      items: [
        {
          id: 'faq-c1',
          question: 'Tôi có được hủy tour sau khi đặt không?',
          answer: 'Có, theo chính sách hủy của từng tour. Liên hệ hotline hoặc email support kèm mã booking càng sớm càng tốt.',
          link: { path: '/terms', text: 'Xem điều khoản & bảng hủy mẫu →' }
        },
        {
          id: 'faq-c2',
          question: 'Hoàn tiền mất bao lâu?',
          answer: 'Thường 7–15 ngày làm việc sau khi yêu cầu hủy được duyệt, qua cùng kênh thanh toán hoặc chuyển khoản ngân hàng.'
        },
        {
          id: 'faq-c3',
          question: 'TravelTour hủy tour thì sao?',
          answer: 'Nếu tour không đủ số khách hoặc bất khả kháng, chúng tôi thông báo sớm và đề xuất đổi lịch hoặc hoàn tiền theo thỏa thuận.'
        },
        {
          id: 'faq-c4',
          question: 'Tôi đến trễ điểm tập trung có được hoàn tiền không?',
          answer: 'Trường hợp no-show (không đến đúng giờ mà không báo trước) thường không được hoàn tiền. Vui lòng liên hệ HDV/hotline nếu có sự cố đặc biệt.'
        }
      ]
    },
    {
      name: 'Trước & trong chuyến đi',
      icon: 'bi-suitcase',
      items: [
        {
          id: 'faq-d1',
          question: 'Cần mang gì khi đi tour?',
          answer: 'Tùy tour: CMND/hộ chiếu, giày thoải mái, kem chống nắng, thuốc cá nhân. Chi tiết thường ghi trong email xác nhận hoặc mô tả tour.'
        },
        {
          id: 'faq-d2',
          question: 'Trẻ em có được giảm giá không?',
          answer: 'Nhiều tour có giá trẻ em (dưới 12 tuổi) hoặc em bé miễn phí kèm người lớn — xem bảng giá trên trang chi tiết tour.'
        },
        {
          id: 'faq-d3',
          question: 'Tour có bao gồm bảo hiểm không?',
          answer: 'Một số tour đã bao gồm bảo hiểm cơ bản trong giá. Bạn có thể mua thêm bảo hiểm du lịch cá nhân nếu cần.'
        },
        {
          id: 'faq-d4',
          question: 'Thời tiết xấu tour có hủy không?',
          answer: 'HDV và đơn vị vận hành đánh giá an toàn. Nếu hủy do thời tiết nguy hiểm, TravelTour thông báo phương án đổi lịch hoặc hoàn tiền theo quy định.'
        }
      ]
    },
    {
      name: 'Bảo mật & kỹ thuật',
      icon: 'bi-shield-lock',
      items: [
        {
          id: 'faq-e1',
          question: 'Thông tin cá nhân có được bảo mật không?',
          answer: 'Có. Chúng tôi mã hóa mật khẩu, dùng HTTPS và không bán dữ liệu cho bên thứ ba.',
          link: { path: '/privacy', text: 'Đọc chính sách bảo mật →' }
        },
        {
          id: 'faq-e2',
          question: 'Tôi không nhận được email xác nhận?',
          answer: 'Kiểm tra hộp thư Spam/Quảng cáo. Đảm bảo email đặt tour đúng. Nếu vẫn không có, gọi 1900 1234 kèm mã giao dịch.'
        },
        {
          id: 'faq-e3',
          question: 'Website báo lỗi khi thanh toán?',
          answer: 'Chụp màn hình lỗi, ghi nhận thời gian và liên hệ hỗ trợ. Không thanh toán trùng nếu chưa chắc giao dịch đầu đã thất bại.'
        }
      ]
    }
  ];
}
