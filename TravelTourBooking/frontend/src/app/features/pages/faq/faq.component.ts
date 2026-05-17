import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page-banner page-banner-travel">
      <div class="container">
        <h1>Câu hỏi thường gặp</h1>
        <p class="lead mb-0">Giải đáp thắc mắc phổ biến</p>
      </div>
    </div>

    <div class="container py-5">
      <div class="col-lg-8 mx-auto">
        <div class="accordion" id="faqAccordion">
          <div class="accordion-item border-0 shadow-sm mb-2">
            <h2 class="accordion-header">
              <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#faq1">
                Làm sao để đặt tour?
              </button>
            </h2>
            <div id="faq1" class="accordion-collapse collapse show" data-bs-parent="#faqAccordion">
              <div class="accordion-body text-muted">
                Chọn tour trên website, đăng nhập, chọn lịch khởi hành còn chỗ và hoàn tất thanh toán.
                <a routerLink="/guide-booking">Xem hướng dẫn chi tiết</a>.
              </div>
            </div>
          </div>
          <div class="accordion-item border-0 shadow-sm mb-2">
            <h2 class="accordion-header">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq2">
                Có được hủy tour không?
              </button>
            </h2>
            <div id="faq2" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
              <div class="accordion-body text-muted">
                Có, tùy chính sách từng tour. Liên hệ hotline 1900 1234 hoặc email support.
              </div>
            </div>
          </div>
          <div class="accordion-item border-0 shadow-sm mb-2">
            <h2 class="accordion-header">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq3">
                Hình thức thanh toán?
              </button>
            </h2>
            <div id="faq3" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
              <div class="accordion-body text-muted">VNPay, MoMo và chuyển khoản ngân hàng.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class FaqComponent {}
