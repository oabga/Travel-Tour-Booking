import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { VoucherService, Voucher } from '../../../services/voucher.service';

@Component({
  selector: 'app-voucher-manage',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="mb-1 text-primary"><i class="bi bi-ticket-perforated me-2"></i>Quản lý Mã giảm giá</h3>
          <p class="text-muted mb-0 small">Thiết lập, cập nhật và theo dõi các chương trình chiết khấu du lịch.</p>
        </div>
        <button class="btn btn-primary px-4 shadow-sm" (click)="showForm()">
          <i class="bi bi-plus-circle me-2"></i>Thêm Voucher mới
        </button>
      </div>

      <!-- Alert Notification -->
      @if (alertMsg) {
        <div class="alert alert-dismissible shadow-sm border-0 mb-4" [class.alert-success]="alertType === 'success'" [class.alert-danger]="alertType === 'danger'">
          <i class="bi me-2" [class.bi-check-circle-fill]="alertType === 'success'" [class.bi-exclamation-triangle-fill]="alertType === 'danger'"></i>
          {{ alertMsg }}
          <button type="button" class="btn-close" (click)="alertMsg = ''"></button>
        </div>
      }

      <div class="row g-4">
        <!-- Form Panel (Collapsible Card) -->
        @if (isFormVisible) {
          <div class="col-lg-4">
            <div class="card border-0 shadow-sm sticky-top" style="top: 24px;">
              <div class="card-header bg-primary text-white py-3">
                <h5 class="card-title mb-0">
                  <i class="bi me-2" [class.bi-plus-circle]="!editingId" [class.bi-pencil-square]="editingId"></i>
                  {{ editingId ? 'Cập nhật Voucher' : 'Tạo mới Voucher' }}
                </h5>
              </div>
              <div class="card-body p-4">
                <form [formGroup]="form" (ngSubmit)="onSubmit()">
                  <div class="mb-3">
                    <label class="form-label fw-bold small text-secondary">Mã Code *</label>
                    <input type="text" class="form-control text-uppercase" formControlName="code" 
                           placeholder="VD: BALO2026" [readonly]="editingId">
                    @if (form.controls.code.invalid && form.controls.code.touched) {
                      <div class="text-danger small mt-1">Mã code không được trống (tối đa 50 ký tự).</div>
                    }
                  </div>

                  <div class="mb-3">
                    <label class="form-label fw-bold small text-secondary">Phần trăm giảm (%) *</label>
                    <input type="number" class="form-control" formControlName="discountPercent" 
                           placeholder="0 - 100" min="0" max="100">
                    @if (form.controls.discountPercent.invalid && form.controls.discountPercent.touched) {
                      <div class="text-danger small mt-1">Tỉ lệ giảm giá phải từ 0% đến 100%.</div>
                    }
                  </div>

                  <div class="mb-3">
                    <label class="form-label fw-bold small text-secondary">Ngày bắt đầu hiệu lực *</label>
                    <input type="datetime-local" class="form-control" formControlName="startDate">
                    @if (form.controls.startDate.invalid && form.controls.startDate.touched) {
                      <div class="text-danger small mt-1">Ngày bắt đầu là bắt buộc.</div>
                    }
                  </div>

                  <div class="mb-3">
                    <label class="form-label fw-bold small text-secondary">Ngày hết hạn *</label>
                    <input type="datetime-local" class="form-control" formControlName="endDate">
                    @if (form.controls.endDate.invalid && form.controls.endDate.touched) {
                      <div class="text-danger small mt-1">Ngày hết hạn là bắt buộc.</div>
                    }
                  </div>

                  <div class="mb-4">
                    <label class="form-label fw-bold small text-secondary">Số lượt sử dụng tối đa *</label>
                    <input type="number" class="form-control" formControlName="maxUsage" min="1">
                    @if (form.controls.maxUsage.invalid && form.controls.maxUsage.touched) {
                      <div class="text-danger small mt-1">Lượt dùng tối đa phải từ 1 trở lên.</div>
                    }
                  </div>

                  <div class="d-flex gap-2">
                    <button type="submit" class="btn btn-success flex-grow-1" [disabled]="form.invalid || loading">
                      @if (loading) {
                        <span class="spinner-border spinner-border-sm me-1"></span>
                      }
                      Lưu lại
                    </button>
                    <button type="button" class="btn btn-outline-secondary" (click)="cancelForm()">
                      Hủy bỏ
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        }

        <!-- List Panel -->
        <div [class.col-lg-8]="isFormVisible" [class.col-lg-12]="!isFormVisible">
          <div class="card border-0 shadow-sm">
            <!-- Search & Filter Header -->
            <div class="card-header bg-white py-3 border-0">
              <div class="row align-items-center g-2">
                <div class="col-md-6">
                  <div class="input-group">
                    <span class="input-group-text bg-light border-0"><i class="bi bi-search"></i></span>
                    <input type="text" class="form-control bg-light border-0" placeholder="Tìm kiếm theo mã Code..."
                           [(ngModel)]="searchQuery" [ngModelOptions]="{standalone: true}" (input)="onSearch()">
                  </div>
                </div>
                <div class="col-md-6 text-md-end">
                  <span class="text-muted small">Tổng cộng: <strong>{{ filteredItems.length }}</strong> mã</span>
                </div>
              </div>
            </div>

            <!-- Table -->
            <div class="table-responsive">
              <table class="table align-middle table-hover mb-0">
                <thead class="table-light text-uppercase fs-7 text-secondary">
                  <tr>
                    <th class="ps-4">Mã Code</th>
                    <th>Chiết khấu</th>
                    <th>Thời gian hiệu lực</th>
                    <th>Trạng thái sử dụng</th>
                    <th>Tình trạng</th>
                    <th class="text-end pe-4">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  @if (filteredItems.length === 0) {
                    <tr>
                      <td colspan="6" class="text-center py-5 text-muted">
                        <i class="bi bi-ticket-detailed fs-1 text-light d-block mb-2"></i>
                        Không tìm thấy mã giảm giá nào.
                      </td>
                    </tr>
                  }
                  @for (v of filteredItems; track v.voucherId) {
                    <tr class="transition-row">
                      <td class="ps-4">
                        <span class="badge bg-primary-subtle text-primary border border-primary-subtle fs-6 px-3 py-2 text-uppercase font-monospace">
                          {{ v.code }}
                        </span>
                      </td>
                      <td>
                        <strong class="text-success fs-5">{{ v.discountPercent }}%</strong>
                      </td>
                      <td>
                        <div class="small">
                          <div><span class="text-muted">Từ:</span> {{ v.startDate | date:'dd/MM/yyyy HH:mm' }}</div>
                          <div><span class="text-muted">Đến:</span> {{ v.endDate | date:'dd/MM/yyyy HH:mm' }}</div>
                        </div>
                      </td>
                      <td>
                        <div class="progress mb-1" style="height: 6px; width: 120px;">
                          <div class="progress-bar bg-info" role="progressbar" 
                               [style.width.%]="(v.usedCount / v.maxUsage) * 100">
                          </div>
                        </div>
                        <small class="text-muted">{{ v.usedCount }} / {{ v.maxUsage }} lượt</small>
                      </td>
                      <td>
                        @if (isExpired(v)) {
                          <span class="badge bg-danger-subtle text-danger border border-danger-subtle">Hết hạn</span>
                        } @else if (v.usedCount >= v.maxUsage) {
                          <span class="badge bg-warning-subtle text-warning border border-warning-subtle">Hết lượt</span>
                        } @else {
                          <span class="badge bg-success-subtle text-success border border-success-subtle">Đang hoạt động</span>
                        }
                      </td>
                      <td class="text-end pe-4">
                        <div class="btn-group">
                          <button class="btn btn-sm btn-outline-primary border-0" (click)="onEdit(v)">
                            <i class="bi bi-pencil-square"></i>
                          </button>
                          <button class="btn btn-sm btn-outline-danger border-0" (click)="onDelete(v)">
                            <i class="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .transition-row {
      transition: all 0.2s ease-in-out;
    }
    .transition-row:hover {
      background-color: rgba(var(--bs-primary-rgb), 0.03);
    }
    .fs-7 {
      font-size: 0.8rem;
    }
  `]
})
export class VoucherManageComponent implements OnInit {
  items: Voucher[] = [];
  filteredItems: Voucher[] = [];
  searchQuery = '';
  
  // UI states
  isFormVisible = false;
  editingId: number | null = null;
  loading = false;
  
  // Notification states
  alertMsg = '';
  alertType: 'success' | 'danger' = 'success';

  form = this.fb.group({
    code: ['', [Validators.required, Validators.maxLength(50)]],
    discountPercent: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    maxUsage: [100, [Validators.required, Validators.min(1)]]
  });

  constructor(
    private fb: FormBuilder,
    private voucherService: VoucherService
  ) {}

  ngOnInit(): void {
    this.loadVouchers();
  }

  loadVouchers(): void {
    this.voucherService.getAll().subscribe({
      next: data => {
        this.items = data;
        this.onSearch();
      },
      error: () => this.showNotification('Không thể tải danh sách voucher.', 'danger')
    });
  }

  onSearch(): void {
    if (!this.searchQuery) {
      this.filteredItems = [...this.items];
    } else {
      const q = this.searchQuery.toLowerCase().trim();
      this.filteredItems = this.items.filter(v => v.code.toLowerCase().includes(q));
    }
  }

  showForm(): void {
    this.isFormVisible = true;
    this.editingId = null;
    this.form.reset({
      code: '',
      discountPercent: 0,
      startDate: '',
      endDate: '',
      maxUsage: 100
    });
  }

  cancelForm(): void {
    this.isFormVisible = false;
    this.editingId = null;
  }

  onEdit(v: Voucher): void {
    this.isFormVisible = true;
    this.editingId = v.voucherId;
    
    // Format dates to ISO format required by input[type="datetime-local"] (yyyy-MM-ddThh:mm)
    const startFormatted = v.startDate ? v.startDate.substring(0, 16) : '';
    const endFormatted = v.endDate ? v.endDate.substring(0, 16) : '';
    
    this.form.patchValue({
      code: v.code,
      discountPercent: v.discountPercent,
      startDate: startFormatted,
      endDate: endFormatted,
      maxUsage: v.maxUsage
    });
  }

  onDelete(v: Voucher): void {
    if (confirm(`Bạn có chắc chắn muốn xóa mã giảm giá "${v.code}"?`)) {
      this.voucherService.delete(v.voucherId).subscribe({
        next: () => {
          this.showNotification(`Đã xóa mã giảm giá "${v.code}" thành công!`, 'success');
          this.loadVouchers();
          if (this.editingId === v.voucherId) {
            this.cancelForm();
          }
        },
        error: () => this.showNotification('Xóa mã giảm giá thất bại.', 'danger')
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    const val = this.form.value;
    const dto: Partial<Voucher> = {
      code: val.code?.trim().toUpperCase(),
      discountPercent: Number(val.discountPercent),
      startDate: val.startDate || undefined,
      endDate: val.endDate || undefined,
      maxUsage: Number(val.maxUsage)
    };

    if (this.editingId) {
      // Update
      this.voucherService.update(this.editingId, dto).subscribe({
        next: () => {
          this.loading = false;
          this.isFormVisible = false;
          this.editingId = null;
          this.showNotification('Cập nhật mã giảm giá thành công!', 'success');
          this.loadVouchers();
        },
        error: (err) => {
          this.loading = false;
          const msg = err.error?.message || 'Cập nhật mã giảm giá thất bại.';
          this.showNotification(msg, 'danger');
        }
      });
    } else {
      // Create
      this.voucherService.create(dto).subscribe({
        next: () => {
          this.loading = false;
          this.isFormVisible = false;
          this.showNotification('Tạo mới mã giảm giá thành công!', 'success');
          this.loadVouchers();
        },
        error: (err) => {
          this.loading = false;
          const msg = err.error?.message || 'Tạo mới mã giảm giá thất bại.';
          this.showNotification(msg, 'danger');
        }
      });
    }
  }

  isExpired(v: Voucher): boolean {
    const end = new Date(v.endDate);
    return end < new Date();
  }

  showNotification(msg: string, type: 'success' | 'danger'): void {
    this.alertMsg = msg;
    this.alertType = type;
    setTimeout(() => {
      if (this.alertMsg === msg) {
        this.alertMsg = '';
      }
    }, 5000);
  }
}
export default VoucherManageComponent;
