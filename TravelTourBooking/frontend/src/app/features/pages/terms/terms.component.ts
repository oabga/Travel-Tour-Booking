import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InfoPageNavComponent } from '../../../shared/components/info-page-nav/info-page-nav.component';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule, RouterLink, InfoPageNavComponent],
  template: `
    <div class="info-page">
      <div class="page-banner page-banner-travel">
        <div class="container text-center">
          <span class="info-hero-badge"><i class="bi bi-file-text me-1"></i>Pháp lý</span>
          <h1>Điều khoản chung</h1>
          <p class="lead mb-0">Quy định khi sử dụng dịch vụ TravelTour Booking</p>
          <p class="small mt-2 opacity-75 mb-0">Có hiệu lực từ: Tháng 5/2026</p>
        </div>
      </div>
      <app-info-page-nav />

      <section class="container py-5">
        <div class="row g-5">
          <div class="col-lg-4 order-lg-2">
            <div class="info-img-frame mb-4" style="height: 220px">
              <img src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=700&q=80" alt="Hợp đồng dịch vụ">
            </div>
            <div class="info-card p-4">
              <h6 class="fw-bold mb-3"><i class="bi bi-info-circle text-primary me-2"></i>Tóm tắt</h6>
              <ul class="small text-muted mb-0 ps-3">
                <li class="mb-2">Booking có hiệu lực sau thanh toán hoặc xác nhận nhân viên.</li>
                <li class="mb-2">Giá và lịch có thể thay đổi theo mùa, số chỗ.</li>
                <li class="mb-2">Hủy tour theo chính sách từng chương trình.</li>
                <li>Khiếu nại qua hotline hoặc email trong 30 ngày.</li>
              </ul>
            </div>
          </div>
          <div class="col-lg-8 order-lg-1">
            <p class="text-muted mb-4">
              Bằng việc truy cập website, đăng ký tài khoản hoặc đặt tour, bạn đồng ý với các điều khoản dưới đây.
              Vui lòng đọc kỹ trước khi thanh toán. Nếu không đồng ý, vui lòng ngừng sử dụng dịch vụ.
            </p>
            <div class="info-card p-4 p-lg-5">
              @for (s of sections; track s.id) {
                <article [id]="s.id" class="info-policy-section">
                  <h4 class="fw-bold mb-3">
                    <span class="text-primary me-2">{{ s.num }}.</span>{{ s.title }}
                  </h4>
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
                </article>
              }
            </div>
            <div class="mt-4 p-4 rounded-3 bg-light border">
              <p class="small text-muted mb-2">
                <i class="bi bi-link-45deg me-1"></i>Xem thêm:
                <a routerLink="/privacy">Chính sách bảo mật</a> ·
                <a routerLink="/guide-booking">Hướng dẫn đặt tour</a> ·
                <a routerLink="/faq">FAQ</a>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="info-section-alt py-5">
        <div class="container">
          <div class="text-center mb-4">
            <span class="info-label">Bảng tham khảo</span>
            <h3 class="fw-bold">Chính sách hủy tour (mẫu)</h3>
            <p class="text-muted small">Chi tiết cuối cùng theo từng tour — xem trong trang chi tiết tour</p>
          </div>
          <div class="table-responsive">
            <table class="table table-hover info-card mb-0">
              <thead class="table-light">
                <tr>
                  <th>Thời điểm hủy</th>
                  <th>Phí hủy (tham khảo)</th>
                  <th>Hoàn tiền</th>
                </tr>
              </thead>
              <tbody class="text-muted">
                @for (row of cancelPolicy; track row.when) {
                  <tr>
                    <td>{{ row.when }}</td>
                    <td>{{ row.fee }}</td>
                    <td>{{ row.refund }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  `
})
export class TermsComponent {
  sections = [
    {
      id: 'defs',
      num: '1',
      title: 'Định nghĩa',
      paragraphs: [
        '"TravelTour", "chúng tôi" là đơn vị vận hành nền tảng đặt tour TravelTour Booking.',
        '"Khách hàng", "bạn" là cá nhân hoặc tổ chức sử dụng dịch vụ đặt tour.',
        '"Booking" là xác nhận đặt chỗ sau khi thanh toán thành công hoặc được nhân viên phê duyệt.'
      ]
    },
    {
      id: 'booking',
      num: '2',
      title: 'Đặt tour và xác nhận',
      paragraphs: [
        'Giá hiển thị trên website là giá tham khảo theo lịch khởi hành và số chỗ còn lại tại thời điểm đặt. TravelTour có quyền từ chối booking nếu hết chỗ, thông tin sai lệch hoặc nghi ngờ gian lận.',
        'Sau khi thanh toán, bạn nhận mã booking qua email. Vui lòng kiểm tra kỹ ngày giờ, điểm tập trung và danh sách hành khách.'
      ],
      list: [
        'Khách phải cung cấp thông tin chính xác, đặc biệt SĐT và email.',
        'Số lượng khách không vượt quá số chỗ đã đặt.',
        'Thay đổi ngày/tour sau khi đặt phụ thuộc tình trạng chỗ trống và phí đổi (nếu có).'
      ]
    },
    {
      id: 'payment',
      num: '3',
      title: 'Thanh toán',
      paragraphs: [
        'Thanh toán qua chuyển khoản, MoMo, VNPay hoặc phương thức được liệt kê trên trang thanh toán. Booking chưa thanh toán có thể bị hủy tự động sau thời hạn giữ chỗ (nếu áp dụng).',
        'Trường hợp chuyển khoản thiếu/sai nội dung, khách cần bổ sung trong 24 giờ hoặc liên hệ hotline.'
      ]
    },
    {
      id: 'cancel',
      num: '4',
      title: 'Hủy tour và hoàn tiền',
      paragraphs: [
        'Chính sách hủy phụ thuộc từng tour (trong nước, nước ngoài, cao cấp). Khách chủ động hủy cần thông báo qua hotline/email và cung cấp mã booking.',
        'Hoàn tiền (nếu đủ điều kiện) thực hiện trong 7–15 ngày làm việc qua cùng kênh thanh toán hoặc chuyển khoản ngân hàng.'
      ],
      list: [
        'Hủy do thiên tai, dịch bệnh, force majeure: xử lý theo thông báo chính thức của TravelTour.',
        'TravelTour hủy tour do không đủ số khách: hoàn 100% hoặc đổi lịch theo thỏa thuận.',
        'Khách không đến đúng giờ (no-show) có thể không được hoàn tiền.'
      ]
    },
    {
      id: 'conduct',
      num: '5',
      title: 'Hành vi và trách nhiệm khách hàng',
      paragraphs: [
        'Khách tuân thủ luật pháp Việt Nam và nước đến, quy định an toàn của HDV và địa điểm tham quan.',
        'TravelTour không chịu trách nhiệm tài sản cá nhân để mất; khuyến nghị mua bảo hiểm du lịch bổ sung khi cần.'
      ],
      list: [
        'Không sử dụng chất cấm, gây rối hoặc làm ảnh hưởng đoàn.',
        'Tôn trọng văn hóa địa phương và môi trường.',
        'Trẻ em dưới 12 tuổi cần có người giám hộ đi cùng trừ khi tour quy định khác.'
      ]
    },
    {
      id: 'liability',
      num: '6',
      title: 'Giới hạn trách nhiệm',
      paragraphs: [
        'TravelTour là nền tảng đặt tour và phối hợp đối tác vận hành. Trách nhiệm về chất lượng dịch vụ trực tiếp (xe, khách sạn, ăn uống) được chia sẻ theo hợp đồng với nhà cung cấp.',
        'Chúng tôi không chịu trách nhiệm thiệt hại gián tiếp, mất lợi nhuận do sự cố ngoài tầm kiểm soát hợp lý (thiên tai, đình công, sự cố giao thông bất khả kháng).'
      ]
    },
    {
      id: 'ip',
      num: '7',
      title: 'Sở hữu trí tuệ',
      paragraphs: [
        'Nội dung website (logo, mô tả tour, hình ảnh do TravelTour sở hữu) không được sao chép thương mại khi chưa có sự đồng ý.',
        'Ảnh tour từ đối tác/Unsplash tuân thủ giấy phép tương ứng.'
      ]
    },
    {
      id: 'account',
      num: '8',
      title: 'Tài khoản người dùng',
      paragraphs: [
        'Bạn chịu trách nhiệm bảo mật mật khẩu. Thông báo ngay nếu phát hiện truy cập trái phép.',
        'TravelTour có quyền khóa tài khoản vi phạm điều khoản hoặc lạm dụng voucher.'
      ]
    },
    {
      id: 'law',
      num: '9',
      title: 'Luật áp dụng và giải quyết tranh chấp',
      paragraphs: [
        'Điều khoản được điều chỉnh bởi pháp luật Việt Nam. Tranh chấp ưu tiên thương lượng; nếu không thành, giải quyết tại Tòa án có thẩm quyền tại TP. Hồ Chí Minh.'
      ]
    },
    {
      id: 'changes',
      num: '10',
      title: 'Sửa đổi điều khoản',
      paragraphs: [
        'Chúng tôi có thể cập nhật điều khoản; phiên bản mới đăng tại trang này. Booking đã xác nhận trước ngày sửa vẫn áp dụng điều khoản tại thời điểm đặt trừ khi pháp luật bắt buộc khác.'
      ]
    }
  ];

  cancelPolicy = [
    { when: 'Trước 30 ngày khởi hành', fee: '0–10% giá tour', refund: '90–100%' },
    { when: '15–29 ngày trước', fee: '20–30%', refund: '70–80%' },
    { when: '7–14 ngày trước', fee: '40–50%', refund: '50–60%' },
    { when: 'Dưới 7 ngày', fee: '70–100%', refund: '0–30% hoặc không hoàn' }
  ];
}
