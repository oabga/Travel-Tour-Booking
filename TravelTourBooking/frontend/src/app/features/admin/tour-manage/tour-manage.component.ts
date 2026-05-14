import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TourService } from '../../../services/tour.service';
import { CategoryService } from '../../../services/category.service';
import { DestinationService } from '../../../services/destination.service';
import { TourList, TourDetail, TourRequest, CategoryResponse, DestinationResponse, PaginationMeta } from '../../../shared/models';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-tour-manage',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PaginationComponent],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3 class="mb-0"><i class="bi bi-map me-2"></i>Quan ly Tour</h3>
      <button class="btn btn-primary" (click)="openForm()">
        <i class="bi bi-plus-circle me-1"></i>Them tour
      </button>
    </div>

    @if (msg) {
      <div class="alert" [class.alert-success]="msgOk" [class.alert-danger]="!msgOk">{{ msg }}</div>
    }

    <!-- Form Modal (inline) -->
    @if (showForm) {
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header d-flex justify-content-between">
          <h5 class="mb-0">{{ editId ? 'Sua' : 'Them' }} tour</h5>
          <button class="btn-close" (click)="showForm=false"></button>
        </div>
        <div class="card-body">
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Ten tour *</label>
                <input type="text" class="form-control" formControlName="tourName">
              </div>
              <div class="col-md-3">
                <label class="form-label">Danh muc *</label>
                <select class="form-select" formControlName="cateId">
                  @for (c of categories; track c.cateId) {
                    <option [ngValue]="c.cateId">{{ c.cateName }}</option>
                  }
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label">Diem den *</label>
                <select class="form-select" formControlName="desId">
                  @for (d of destinations; track d.desId) {
                    <option [ngValue]="d.desId">{{ d.desName }}</option>
                  }
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label">So ngay *</label>
                <input type="number" class="form-control" formControlName="durationDays">
              </div>
              <div class="col-md-3">
                <label class="form-label">Gia (VND) *</label>
                <input type="number" class="form-control" formControlName="price">
              </div>
              <div class="col-md-3">
                <label class="form-label">Suc chua *</label>
                <input type="number" class="form-control" formControlName="maxCapacity">
              </div>
              <div class="col-md-3">
                <label class="form-label">Anh URL</label>
                <input type="text" class="form-control" formControlName="imageUrl">
              </div>
              <div class="col-12">
                <label class="form-label">Mo ta</label>
                <textarea class="form-control" formControlName="description" rows="2"></textarea>
              </div>
            </div>
            <div class="mt-3">
              <button type="submit" class="btn btn-primary me-2" [disabled]="saving || form.invalid">
                @if (saving) { <span class="spinner-border spinner-border-sm me-1"></span> }
                {{ editId ? 'Cap nhat' : 'Them moi' }}
              </button>
              <button type="button" class="btn btn-secondary" (click)="showForm=false">Huy</button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Table -->
    @if (loading) {
      <div class="spinner-overlay"><div class="spinner-border text-primary"></div></div>
    } @else {
      <div class="table-responsive">
        <table class="table table-hover align-middle">
          <thead class="table-light">
            <tr>
              <th>ID</th><th>Ten tour</th><th>Danh muc</th><th>Diem den</th>
              <th>Gia</th><th>So ngay</th><th>Rating</th><th></th>
            </tr>
          </thead>
          <tbody>
            @for (t of tours; track t.tourId) {
              <tr>
                <td>{{ t.tourId }}</td>
                <td>{{ t.tourName }}</td>
                <td>{{ t.cateName }}</td>
                <td>{{ t.desName }}</td>
                <td>{{ t.price | number:'1.0-0' }}</td>
                <td>{{ t.durationDays }}</td>
                <td>{{ t.avgRating | number:'1.1-1' }}</td>
                <td>
                  <button class="btn btn-sm btn-outline-primary me-1" (click)="onEdit(t)">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" (click)="onDelete(t.tourId)">
                    <i class="bi bi-trash"></i>
                  </button>
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

  form = this.fb.nonNullable.group({
    tourName: ['', Validators.required],
    cateId: [0, Validators.required],
    desId: [0, Validators.required],
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
    private desSvc: DestinationService
  ) {}

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

  openForm(tour?: TourList): void {
    this.showForm = true;
    this.editId = null;
    this.form.reset({ tourName: '', cateId: 0, desId: 0, durationDays: 1, price: 0, maxCapacity: 1, description: '', imageUrl: '' });
  }

  onEdit(t: TourList): void {
    this.showForm = true;
    this.editId = t.tourId;
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
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const dto: TourRequest = this.form.getRawValue();

    const obs = this.editId
      ? this.tourSvc.update(this.editId, dto)
      : this.tourSvc.create(dto);

    obs.subscribe({
      next: () => {
        this.msg = this.editId ? 'Cap nhat thanh cong.' : 'Them tour thanh cong.';
        this.msgOk = true;
        this.saving = false;
        this.showForm = false;
        this.loadTours();
      },
      error: err => {
        this.msg = err.error?.message || 'Loi khi luu tour.';
        this.msgOk = false;
        this.saving = false;
      }
    });
  }

  onDelete(id: number): void {
    if (!confirm('Ban co chac muon xoa tour nay?')) return;
    this.tourSvc.delete(id).subscribe({
      next: () => { this.msg = 'Xoa thanh cong.'; this.msgOk = true; this.loadTours(); },
      error: err => { this.msg = err.error?.message || 'Xoa that bai.'; this.msgOk = false; }
    });
  }

  onPage(p: number): void {
    this.pagination = { ...this.pagination, page: p };
    this.loadTours();
  }
}
