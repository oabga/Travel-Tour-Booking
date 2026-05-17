import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TourService } from '../../../services/tour.service';
import { CategoryService } from '../../../services/category.service';
import { DestinationService } from '../../../services/destination.service';
import { TourList, CategoryResponse, DestinationResponse, PaginationMeta } from '../../../shared/models';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-tour-manage',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PaginationComponent],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3 class="mb-0"><i class="bi bi-map me-2"></i>Quản lý Tour</h3>
      <div>
        @if (isAdmin) {
          <!-- NÚT EXPORT (GỌI HÀM ONEXPORTXML ĐỂ ĐÍNH KÈM TOKEN) -->
          <button class="btn btn-success me-2" (click)="onExportXml()">
            <i class="bi bi-download me-1"></i>Export XML
          </button>
          <!-- NÚT IMPORT -->
          <button class="btn btn-warning me-2" onclick="document.getElementById('fileXml').click()">
            <i class="bi bi-upload me-1"></i>Import XML
          </button>
          <input type="file" id="fileXml" style="display:none" accept=".xml" (change)="onImportXml($event)">

          <button class="btn btn-primary" (click)="openForm()">
            <i class="bi bi-plus-circle me-1"></i>Thêm tour
          </button>
        }
      </div>
    </div>

    @if (msg) {
      <div class="alert" [class.alert-success]="msgOk" [class.alert-danger]="!msgOk">{{ msg }}</div>
    }

    @if (showForm) {
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header d-flex justify-content-between">
          <h5 class="mb-0">{{ editId ? 'Sửa' : 'Thêm' }} tour</h5>
          <button class="btn-close" (click)="showForm=false"></button>
        </div>
        <div class="card-body">
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Tên tour *</label>
                <input type="text" class="form-control" formControlName="tourName">
              </div>
              <div class="col-md-3">
                <label class="form-label">Danh mục *</label>
                <select class="form-select" formControlName="cateId">
                  @for (c of categories; track c.cateId) {
                    <option [ngValue]="c.cateId">{{ c.cateName }}</option>
                  }
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label">Điểm đến *</label>
                <select class="form-select" formControlName="desId">
                  @for (d of destinations; track d.desId) {
                    <option [ngValue]="d.desId">{{ d.desName }}</option>
                  }
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label">Số ngày *</label>
                <input type="number" class="form-control" formControlName="durationDays">
              </div>
              <div class="col-md-3">
                <label class="form-label">Giá (VND) *</label>
                <input type="number" class="form-control" formControlName="price">
              </div>
              <div class="col-md-3">
                <label class="form-label">Sức chứa *</label>
                <input type="number" class="form-control" formControlName="maxCapacity">
              </div>

              <div class="col-md-3">
                <label class="form-label">Ảnh Tour</label>
                <input type="file" class="form-control" (change)="onFileChange($event)" accept="image/*" />
                @if (imagePreview) {
                  <img [src]="imagePreview.startsWith('data:') ? imagePreview : imgBase + imagePreview" 
                       class="img-thumbnail mt-2" style="max-height:80px;" />
                }
              </div>

              <div class="col-12">
                <label class="form-label">Mô tả</label>
                <textarea class="form-control" formControlName="description" rows="2"></textarea>
              </div>
            </div>
            <div class="mt-3">
              <button type="submit" class="btn btn-primary me-2" [disabled]="saving || form.invalid">
                @if (saving) { <span class="spinner-border spinner-border-sm me-1"></span> }
                {{ editId ? 'Cập nhật' : 'Lưu' }}
              </button>
              <button type="button" class="btn btn-secondary" (click)="showForm=false">Hủy</button>
            </div>
          </form>
        </div>
      </div>
    }

    @if (loading) {
      <div class="spinner-overlay"><div class="spinner-border text-primary"></div></div>
    } @else {
      <div class="table-responsive">
        <table class="table table-hover align-middle">
          <thead class="table-light">
            <tr>
              <th>ID</th><th>Ảnh</th><th>Tên tour</th><th>Danh mục</th><th>Điểm đến</th>
              <th>Giá</th><th>Ngày</th><th></th>
            </tr>
          </thead>
          <tbody>
            @for (t of tours; track t.tourId) {
              <tr>
                <td>{{ t.tourId }}</td>
                <td>
                  <img [src]="t.imageUrl ? imgBase + t.imageUrl : '/assets/images/default-tour.jpg'" 
                       style="width: 45px; height: 45px; object-fit: cover;" class="rounded border">
                </td>
                <td>{{ t.tourName }}</td>
                <td>{{ t.cateName }}</td>
                <td>{{ t.desName }}</td>
                <td>{{ t.price | number:'1.0-0' }}</td>
                <td>{{ t.durationDays }}</td>
                <td>
                  @if (isAdmin) {
                    <button class="btn btn-sm btn-outline-primary me-1" (click)="onEdit(t)">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" (click)="onDelete(t.tourId)">
                      <i class="bi bi-trash"></i>
                    </button>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <app-pagination [meta]="pagination" (pageChange)="onPage($event)" />
    }
  `
})
export class TourManageComponent implements OnInit {
  tours: TourList[] = [];
  categories: CategoryResponse[] = [];
  destinations: DestinationResponse[] = [];
  pagination: PaginationMeta = { page: 1, pageSize: 10, totalCount: 0, totalPages: 0, hasPrev: false, hasNext: false };
  loading = true;
  showForm = false;
  saving = false;
  editId: number | null = null;
  msg = '';
  msgOk = false;
  isAdmin = false;
  readonly imgBase = environment.imageBaseUrl;

  selectedFile: File | null = null;
  imagePreview: string | null = null;

  form = this.fb.nonNullable.group({
    tourName: ['', Validators.required],
    cateId: [0, [Validators.required, Validators.min(1)]],
    desId: [0, [Validators.required, Validators.min(1)]],
    durationDays: [1, [Validators.required, Validators.min(1)]],
    price: [0, [Validators.required, Validators.min(1)]],
    maxCapacity: [1, [Validators.required, Validators.min(1)]],
    description: [''],
    imageUrl: ['']
  });

  constructor(
    private fb: FormBuilder,
    private tourSvc: TourService,
    private cateSvc: CategoryService,
    private desSvc: DestinationService,
    private http: HttpClient,
    private authSvc: AuthService
  ) {
    this.isAdmin = this.authSvc.hasRole('Admin');
  }

  ngOnInit(): void {
    this.cateSvc.getAll().subscribe(d => this.categories = d);
    this.desSvc.getAll().subscribe(d => this.destinations = d);
    this.loadTours();
  }

  loadTours(): void {
    this.loading = true;
    this.tourSvc.getAll(this.pagination.page, this.pagination.pageSize).subscribe({
      next: r => { this.tours = r.items; this.pagination = r.pagination; this.loading = false; },
      error: () => this.loading = false
    });
  }

  openForm(): void {
    this.showForm = true;
    this.editId = null;
    this.selectedFile = null;
    this.imagePreview = null;
    this.form.reset();
  }

  onEdit(t: TourList): void {
    this.showForm = true;
    this.editId = t.tourId;
    this.selectedFile = null;
    this.tourSvc.getById(t.tourId).subscribe(detail => {
      this.form.patchValue({
        tourName: detail.tourName || '',
        cateId: this.categories.find(c => c.cateName === detail.cateName)?.cateId || 0,
        desId: this.destinations.find(d => d.desName === detail.desName)?.desId || 0,
        durationDays: detail.durationDays,
        price: detail.price,
        maxCapacity: detail.maxCapacity,
        description: detail.description || '',
        imageUrl: detail.imageUrl || ''
      });
      this.imagePreview = detail.imageUrl || null;
    });
  }

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => this.imagePreview = reader.result as string;
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving = true;

    const formData = new FormData();
    const val = this.form.getRawValue();

    formData.append('tourName', val.tourName);
    formData.append('cateId', val.cateId.toString());
    formData.append('desId', val.desId.toString());
    formData.append('durationDays', val.durationDays.toString());
    formData.append('price', val.price.toString());
    formData.append('maxCapacity', val.maxCapacity.toString());
    formData.append('description', val.description || '');

    if (this.selectedFile) {
      formData.append('ImageFile', this.selectedFile);
    } else if (val.imageUrl) {
      formData.append('imageUrl', val.imageUrl);
    }

    const obs = this.editId ? this.tourSvc.update(this.editId, formData) : this.tourSvc.create(formData);

    obs.subscribe({
      next: () => {
        this.msg = 'Thao tác thành công.';
        this.msgOk = true;
        this.saving = false;
        this.showForm = false;
        this.loadTours();
      },
      error: err => {
        this.msg = err.error?.message || 'Lỗi lưu dữ liệu.';
        this.msgOk = false;
        this.saving = false;
      }
    });
  }

  onDelete(id: number): void {
    if (confirm('Xóa tour này?')) {
      this.tourSvc.delete(id).subscribe({
        next: () => {
          this.msg = 'Xóa tour thành công.';
          this.msgOk = true;
          this.loadTours();
        },
        error: err => {
          this.msg = err.error?.message || 'Xóa tour thất bại.';
          this.msgOk = false;
        }
      });
    }
  }

  onPage(p: number): void {
    this.pagination.page = p;
    this.loadTours();
  }

  onImportXml(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    this.http.post(environment.apiUrl + '/tours/import/xml', formData).subscribe({
      next: (res: any) => { alert(res.message); this.loadTours(); },
      error: () => alert("Import thất bại!")
    });
  }

  onExportXml(): void {
    this.http.get(environment.apiUrl + '/tours/export/xml', { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tours_export.xml';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: () => alert("Export thất bại! Bạn cần đăng nhập bằng Admin.")
    });
  }
}
