import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-info-page-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="info-page-nav" aria-label="Trang thông tin">
      <div class="container">
        <div class="info-nav-scroll">
          @for (link of links; track link.path) {
            <a [routerLink]="link.path" routerLinkActive="active" class="info-nav-link">
              <i class="bi {{ link.icon }}"></i>
              <span>{{ link.label }}</span>
            </a>
          }
        </div>
      </div>
    </nav>
  `
})
export class InfoPageNavComponent {
  links = [
    { path: '/about', label: 'Về chúng tôi', icon: 'bi-building' },
    { path: '/guide-booking', label: 'Hướng dẫn đặt tour', icon: 'bi-journal-check' },
    { path: '/privacy', label: 'Chính sách bảo mật', icon: 'bi-shield-lock' },
    { path: '/terms', label: 'Điều khoản chung', icon: 'bi-file-text' },
    { path: '/faq', label: 'Câu hỏi thường gặp', icon: 'bi-question-circle' }
  ];
}
