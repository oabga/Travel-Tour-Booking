import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationMeta } from '../../models';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (meta && meta.totalPages > 1) {
      <nav>
        <ul class="pagination justify-content-center">
          <li class="page-item" [class.disabled]="!meta.hasPrev">
            <a class="page-link" (click)="onPage(meta.page - 1)" role="button">
              <i class="bi bi-chevron-left"></i>
            </a>
          </li>
          @for (p of pages; track p) {
            <li class="page-item" [class.active]="p === meta.page">
              <a class="page-link" (click)="onPage(p)" role="button">{{ p }}</a>
            </li>
          }
          <li class="page-item" [class.disabled]="!meta.hasNext">
            <a class="page-link" (click)="onPage(meta.page + 1)" role="button">
              <i class="bi bi-chevron-right"></i>
            </a>
          </li>
        </ul>
      </nav>
    }
  `
})
export class PaginationComponent {
  @Input() meta!: PaginationMeta;
  @Output() pageChange = new EventEmitter<number>();

  get pages(): number[] {
    if (!this.meta) return [];
    const total = this.meta.totalPages;
    const current = this.meta.page;
    const delta = 2;
    const range: number[] = [];
    for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) {
      range.push(i);
    }
    return range;
  }

  onPage(p: number): void {
    if (p >= 1 && p <= this.meta.totalPages && p !== this.meta.page) {
      this.pageChange.emit(p);
    }
  }
}
