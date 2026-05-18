import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TourService } from '../../../services/tour.service';
import { CategoryService } from '../../../services/category.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { TourList, PaginationMeta, CategoryResponse, PopularTourResult } from '../../../shared/models';
import { environment } from '../../../../environments/environment';
import { formatDurationMenuLabel } from '../../../shared/utils/tour-duration.util';
import { buildImageLayer, getCategoryStockImage, getDestinationStockImage, PROMO_GALLERY_IMAGES } from '../../../shared/utils/category-image.util';
import { getTourDisplayImageUrl, handleTourImageError, resolveTourImageUrl } from '../../../shared/utils/tour-image.util';
import { TestimonialsSectionComponent } from '../../../shared/components/testimonials-section/testimonials-section.component';

interface CategoryTheme {
  gradient: string;
  icon: string;
}

@Component({
    selector: 'app-tour-list',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule, PaginationComponent, TestimonialsSectionComponent],
    template: `
    @if (isBrowsePage) {
      <section class="page-banner page-banner-travel browse-banner"
               [ngStyle]="browseBannerStyle">
        <div class="container">
          <nav class="browse-breadcrumb mb-3">
            <a routerLink="/" class="text-white-50 text-decoration-none small">Trang chủ</a>
            <span class="text-white-50 mx-2">/</span>
            <span class="text-white small">{{ pageTitle }}</span>
          </nav>
          <h1 class="mb-2">{{ pageTitle }}</h1>
          @if (pageSubtitle) {
            <p class="lead mb-3 opacity-90">{{ pageSubtitle }}</p>
          }
          <div class="browse-stats d-flex flex-wrap gap-3">
            <span class="browse-stat-chip"><i class="bi bi-map me-1"></i>{{ pagination.totalCount }} tour</span>
            <span class="browse-stat-chip"><i class="bi bi-shield-check me-1"></i>Đặt tour an toàn</span>
            <span class="browse-stat-chip"><i class="bi bi-headset me-1"></i>Hỗ trợ 24/7</span>
          </div>
        </div>
      </section>
    } @else {
    <section class="hero-split hero-section-travel">
      <div class="container py-4 py-lg-5">
        <div class="row align-items-center g-4">
          <div class="col-lg-5 text-white hero-split-copy">
            <span class="hero-eyebrow">TravelTour — Đặt tour dễ dàng</span>
            <h1 class="display-5 fw-bold mb-3">Khám phá Việt Nam & Thế giới</h1>
            <p class="lead mb-4 opacity-90">Hàng trăm tour chất lượng, giá minh bạch, hỗ trợ tận tâm 24/7.</p>
        <div class="hero-search">
          <div class="input-group input-group-lg bg-white rounded shadow">
            <span class="input-group-text bg-white border-0"><i class="bi bi-geo-alt text-primary"></i></span>
            <input type="text" class="form-control border-0" placeholder="Bạn muốn đi đâu?"
                   [(ngModel)]="searchDestination">
            <button class="btn btn-accent px-4 fw-semibold" (click)="goSearch()">
              <i class="bi bi-search me-1"></i>Tìm Tour
            </button>
          </div>
        </div>
            <div class="mt-3 d-flex flex-wrap gap-2">
              @for (c of categories.slice(0, 6); track c.cateId) {
                <span class="badge bg-white bg-opacity-25 text-white px-3 py-2 rounded-pill cursor-pointer"
                      (click)="navigateToCategory(c.cateId)">{{ c.cateName }}</span>
              }
            </div>
          </div>
          @if (heroSlides.length) {
            <div class="col-lg-7">
              <div id="heroTourCarousel" class="carousel slide hero-carousel shadow-lg" data-bs-ride="carousel">
                <div class="carousel-indicators">
                  @for (t of heroSlides; track t.tourId; let i = $index) {
                    <button type="button" data-bs-target="#heroTourCarousel" [attr.data-bs-slide-to]="i"
                            [class.active]="i === 0"></button>
                  }
                </div>
                <div class="carousel-inner rounded-4 overflow-hidden">
                  @for (t of heroSlides; track t.tourId; let i = $index) {
                    <div class="carousel-item" [class.active]="i === 0">
                      <a [routerLink]="['/tours', t.tourId]" class="d-block text-decoration-none">
                        <img [src]="tourImg(t.imageUrl, t.desName, t.cateName)" class="d-block w-100 hero-carousel-img"
                             [alt]="t.tourName" referrerpolicy="no-referrer"
                             (error)="handleImageError($event, t.desName, t.cateName)">
                        <div class="carousel-caption hero-carousel-caption text-start">
                          <span class="badge bg-danger mb-2">Hot</span>
                          <h5 class="fw-bold mb-1">{{ t.tourName }}</h5>
                          <p class="mb-0 small opacity-90"><i class="bi bi-geo-alt me-1"></i>{{ t.desName }}</p>
                        </div>
                      </a>
                    </div>
                  }
                </div>
                <button class="carousel-control-prev" type="button" data-bs-target="#heroTourCarousel" data-bs-slide="prev">
                  <span class="carousel-control-prev-icon"></span>
                </button>
                <button class="carousel-control-next" type="button" data-bs-target="#heroTourCarousel" data-bs-slide="next">
                  <span class="carousel-control-next-icon"></span>
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    </section>

    <section class="promo-gallery-section">
      <div class="container-fluid px-0">
        <div class="row g-0">
          @for (img of promoGallery; track img.url) {
            <div class="col-md-4">
              <div class="promo-gallery-tile" [style.background-image]="'url(' + img.url + ')'">
                <span class="promo-gallery-label">{{ img.label }}</span>
              </div>
            </div>
          }
        </div>
      </div>
    </section>

    @if (popularTours.length) {
      <section class="container py-5">
        <div class="text-center mb-4">
          <h2 class="section-title"><i class="bi bi-fire text-danger me-2"></i>Tour nổi bật</h2>
          <p class="section-subtitle">Được khách đặt nhiều nhất tháng này</p>
        </div>
        <div class="row g-4">
          @for (t of popularTours; track t.tourId) {
            <div class="col-lg-3 col-md-6">
              <a [routerLink]="['/tours', t.tourId]" class="text-decoration-none">
                <div class="card card-tour h-100">
                  <div class="card-img-wrapper">
                    <img [src]="tourImg(t.imageUrl, t.desName, t.cateName)"
                           class="card-img-top" [alt]="t.tourName" referrerpolicy="no-referrer"
                           (error)="handleImageError($event, t.desName, t.cateName)">
                    <span class="tour-duration-badge"><i class="bi bi-clock me-1"></i>Hot</span>
                  </div>
                  <div class="card-body">
                    <h6 class="card-title text-dark text-truncate">{{ t.tourName }}</h6>
                    <p class="text-muted small mb-2"><i class="bi bi-geo-alt me-1"></i>{{ t.desName }}</p>
                    <div class="d-flex justify-content-between align-items-center">
                      <span class="text-warning small">
                        @for (s of [1,2,3,4,5]; track s) {
                          <i class="bi" [class.bi-star-fill]="s <= t.avgRating" [class.bi-star]="s > t.avgRating"></i>
                        }
                      </span>
                      <small class="text-muted">{{ t.totalBookings }} lượt đặt</small>
                    </div>
                  </div>
                </div>
              </a>
            </div>
          }
        </div>
      </section>
    }
    }

    @if (!isBrowsePage && categories.length) {
      <section class="category-explore-section py-5">
        <div class="container">
          <div class="text-center mb-4">
            <h2 class="section-title"><i class="bi bi-compass text-primary me-2"></i>Khám phá theo danh mục</h2>
            <p class="section-subtitle mb-0">Chọn vùng miền hoặc phong cách tour bạn yêu thích</p>
          </div>
          <div class="row g-3">
            @for (c of categories; track c.cateId; let i = $index) {
              <div class="col-6 col-md-4 col-lg-3">
                <a class="category-explore-card text-decoration-none" role="button"
                   (click)="navigateToCategory(c.cateId)"
                   [attr.data-category]="c.cateName"
                   [style.--cat-img]="categoryBgImage(c)">
                  <div class="category-explore-overlay" aria-hidden="true"></div>
                  <div class="category-explore-content">
                    <i class="bi category-explore-icon" [ngClass]="getCategoryIcon(c.cateName, i)"></i>
                    <span class="category-explore-name">{{ c.cateName }}</span>
                    @if (c.description) {
                      <small class="category-explore-desc">{{ c.description }}</small>
                    }
                  </div>
                </a>
              </div>
            }
          </div>
        </div>
      </section>
    }

    <section id="tour-results" class="tour-results-section py-5">
      <div class="container">
        @if (!isBrowsePage) {
          <div class="text-center mb-4">
            <h2 class="section-title">Danh sách Tour</h2>
            <p class="section-subtitle">Ưu đãi hấp dẫn — đặt ngay để giữ chỗ tốt nhất</p>
          </div>
        }

        @if (loading) {
          <div class="text-center py-5"><div class="spinner-border text-primary"></div></div>
        } @else if (tours.length === 0) {
          <div class="empty-state">
            <i class="bi bi-search"></i>
            <p>Không tìm thấy tour nào phù hợp.</p>
            <a routerLink="/" class="btn btn-outline-primary btn-sm mt-2">Về trang chủ</a>
          </div>
        } @else {
          <div class="row g-4">
            @for (tour of tours; track tour.tourId) {
              <div class="col-md-6 col-lg-4">
                <a [routerLink]="['/tours', tour.tourId]" class="text-decoration-none">
                  <div class="card card-tour card-tour-rich h-100">
                    <div class="card-img-wrapper">
                      <img [src]="tourImg(tour.imageUrl, tour.desName, tour.cateName, tour.tourName)"
                           class="card-img-top" referrerpolicy="no-referrer"
                           (error)="handleImageError($event, tour.desName, tour.cateName, tour.tourName)" [alt]="tour.tourName">
                      @if (tour.cateName) {
                        <span class="tour-cate-badge">{{ tour.cateName }}</span>
                      }
                      <span class="tour-duration-badge">
                        <i class="bi bi-clock me-1"></i>{{ tour.durationDays }} ngày
                      </span>
                    </div>
                    <div class="card-body d-flex flex-column">
                      <h6 class="card-title text-dark">{{ tour.tourName }}</h6>
                      <p class="text-muted small mb-2">
                        <i class="bi bi-geo-alt me-1 text-primary"></i>{{ tour.desName }}
                      </p>
                      @if (tour.avgRating) {
                        <div class="mb-2">
                          <span class="text-warning small">
                            @for (s of [1,2,3,4,5]; track s) {
                              <i class="bi" [class.bi-star-fill]="s <= tour.avgRating!" [class.bi-star]="s > tour.avgRating!"></i>
                            }
                          </span>
                          <small class="text-muted ms-1">{{ tour.avgRating | number:'1.1-1' }}</small>
                        </div>
                      }
                      <div class="mt-auto d-flex justify-content-between align-items-center pt-2 border-top">
                        <div>
                          <span class="tour-price">{{ tour.price | number:'1.0-0' }}đ</span>
                          <small class="text-muted d-block">/ người</small>
                        </div>
                        <span class="btn btn-sm btn-accent rounded-pill px-3">Xem tour</span>
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            }
          </div>
          <div class="mt-4">
            <app-pagination [meta]="pagination" (pageChange)="onPageChange($event)" />
          </div>
        }
      </div>
    </section>

    @if (isBrowsePage) {
      <section class="cta-strip py-4">
        <div class="container text-center text-white">
          <h5 class="mb-2">Cần tư vấn thêm về tour?</h5>
          <p class="mb-3 opacity-90 small">Đội ngũ TravelTour sẵn sàng hỗ trợ 24/7</p>
          <a routerLink="/contact" class="btn btn-light btn-sm rounded-pill px-4">Liên hệ ngay</a>
        </div>
      </section>
    }

    @if (!isBrowsePage) {
    <app-testimonials-section />
    <section class="container py-5">
      <div class="text-center mb-5">
        <h2 class="section-title">Vì sao chọn TravelTour?</h2>
        <p class="section-subtitle">Những cam kết của chúng tôi dành cho bạn</p>
      </div>
      <div class="row g-4">
        <div class="col-md-3 col-6">
          <div class="feature-card bg-white shadow-sm">
            <div class="feature-icon bg-primary bg-opacity-10">
              <i class="bi bi-shield-check text-primary"></i>
            </div>
            <h6 class="fw-bold">Uy tín hàng đầu</h6>
            <p class="text-muted small mb-0">Cam kết chất lượng dịch vụ tốt nhất</p>
          </div>
        </div>
        <div class="col-md-3 col-6">
          <div class="feature-card bg-white shadow-sm">
            <div class="feature-icon bg-success bg-opacity-10">
              <i class="bi bi-wallet2 text-success"></i>
            </div>
            <h6 class="fw-bold">Giá tốt nhất</h6>
            <p class="text-muted small mb-0">Giá cả minh bạch, không phí ẩn</p>
          </div>
        </div>
        <div class="col-md-3 col-6">
          <div class="feature-card bg-white shadow-sm">
            <div class="feature-icon bg-warning bg-opacity-10">
              <i class="bi bi-headset text-warning"></i>
            </div>
            <h6 class="fw-bold">Hỗ trợ 24/7</h6>
            <p class="text-muted small mb-0">Luôn sẵn sàng hỗ trợ mọi lúc</p>
          </div>
        </div>
        <div class="col-md-3 col-6">
          <div class="feature-card bg-white shadow-sm">
            <div class="feature-icon bg-info bg-opacity-10">
              <i class="bi bi-globe text-info"></i>
            </div>
            <h6 class="fw-bold">Nhiều lựa chọn</h6>
            <p class="text-muted small mb-0">50+ tour trong và ngoài nước</p>
          </div>
        </div>
      </div>
    </section>
    }
  `
})
export class TourListComponent implements OnInit {
    private scrollToResults = false;
    tours: TourList[] = [];
    popularTours: PopularTourResult[] = [];
    heroSlides: PopularTourResult[] = [];
    readonly environment = environment;
    categories: CategoryResponse[] = [];
    categoryCoverByCateId: Record<number, string> = {};
    readonly promoGallery = [
        { label: 'Biển đảo', url: PROMO_GALLERY_IMAGES.beach },
        { label: 'Núi rừng', url: PROMO_GALLERY_IMAGES.mountain },
        { label: 'Di sản', url: PROMO_GALLERY_IMAGES.heritage },
    ];
    pagination: PaginationMeta = { page: 1, pageSize: 9, totalCount: 0, totalPages: 0, hasPrev: false, hasNext: false };
    loading = false;
    searchDestination = '';

    filterCateId?: number;
    filterDesId?: number;
    filterDurationDays?: number;

    private readonly categoryThemes: CategoryTheme[] = [
        { gradient: 'linear-gradient(135deg, #0e7490, #06b6d4)', icon: 'bi-water' },
        { gradient: 'linear-gradient(135deg, #ea580c, #f97316)', icon: 'bi-sun' },
        { gradient: 'linear-gradient(135deg, #7c3aed, #a78bfa)', icon: 'bi-building' },
        { gradient: 'linear-gradient(135deg, #059669, #34d399)', icon: 'bi-tree' },
        { gradient: 'linear-gradient(135deg, #dc2626, #f87171)', icon: 'bi-heart' },
        { gradient: 'linear-gradient(135deg, #2563eb, #60a5fa)', icon: 'bi-airplane' },
        { gradient: 'linear-gradient(135deg, #ca8a04, #facc15)', icon: 'bi-compass' },
        { gradient: 'linear-gradient(135deg, #0c4a6e, #38bdf8)', icon: 'bi-geo-alt' },
    ];

    get isBrowsePage(): boolean {
        const onToursRoute = this.route.snapshot.routeConfig?.path === 'tours';
        const hasFilter = this.filterCateId != null
            || this.filterDurationDays != null
            || this.filterDesId != null;
        return onToursRoute || hasFilter;
    }

    get pageTitle(): string {
        if (this.filterCateId != null) {
            const cat = this.categories.find(c => c.cateId === this.filterCateId);
            return cat ? `Tour: ${cat.cateName}` : 'Danh sách tour';
        }
        if (this.filterDurationDays != null) {
            return `Tour theo thời lượng: ${formatDurationMenuLabel(this.filterDurationDays)}`;
        }
        return 'Danh sách tour';
    }

    get browseBannerStyle(): Record<string, string> | null {
        if (!this.isBrowsePage) return null;
        const first = this.tours[0];
        const url = first
            ? getTourDisplayImageUrl(first.imageUrl, first.desName, first.cateName)
            : getCategoryStockImage(this.pageTitle.replace(/^Tour:\s*/, ''));
        return {
            backgroundImage: buildImageLayer(
                url,
                'linear-gradient(135deg, rgba(14,116,144,.88) 0%, rgba(12,74,110,.78) 100%)'
            ),
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        };
    }

    get pageSubtitle(): string | null {
        if (this.filterCateId != null) {
            return this.categories.find(c => c.cateId === this.filterCateId)?.description ?? null;
        }
        if (this.filterDurationDays != null) {
            return `Các tour ${formatDurationMenuLabel(this.filterDurationDays)} — lịch trình tối ưu, giá minh bạch.`;
        }
        return null;
    }

    constructor(
        private tourSvc: TourService,
        private cateSvc: CategoryService,
        private router: Router,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        this.cateSvc.getAll().subscribe(d => {
            this.categories = d;
            this.loadCategoryCovers();
        });
        this.tourSvc.getPopular().subscribe(d => {
            this.popularTours = d.slice(0, 4);
            this.heroSlides = d.slice(0, 5);
        });

        this.route.queryParams.subscribe(params => {
            this.filterCateId = params['cateId'] ? +params['cateId'] : undefined;
            this.filterDesId = params['desId'] ? +params['desId'] : undefined;
            this.filterDurationDays = params['durationDays'] ? +params['durationDays'] : undefined;
            this.pagination.page = 1;
            this.scrollToResults = this.isBrowsePage;
            this.loadTours();
        });
    }

    getCategoryTheme(index: number): CategoryTheme {
        return this.categoryThemes[index % this.categoryThemes.length];
    }

    private readonly categoryIcons: Record<string, string> = {
        Adventure: 'bi-signpost-split',
        Luxury: 'bi-gem',
        Family: 'bi-people-fill',
        Beach: 'bi-umbrella-fill',
    };

    getCategoryIcon(cateName: string, index: number): string {
        return this.categoryIcons[cateName] ?? this.getCategoryTheme(index).icon;
    }

    categoryBgImage(c: CategoryResponse): string {
        const cover = this.categoryCoverByCateId[c.cateId];
        const url = cover
            ? (resolveTourImageUrl(cover) ?? getCategoryStockImage(c.cateName))
            : getCategoryStockImage(c.cateName);
        return `url('${url}')`;
    }

    loadCategoryCovers(): void {
        this.tourSvc.getAll(1, 48).subscribe(res => {
            const map: Record<number, string> = {};
            for (const t of res.items) {
                if (!t.imageUrl || !t.cateName) continue;
                const cat = this.categories.find(c => c.cateName === t.cateName);
                if (cat && !map[cat.cateId]) map[cat.cateId] = t.imageUrl!;
            }
            this.categoryCoverByCateId = map;
        });
    }

    navigateToCategory(cateId: number): void {
        this.router.navigate(['/tours'], { queryParams: { cateId } });
    }

    tourImg(
        imageUrl: string | null | undefined,
        desName?: string | null,
        cateName?: string | null,
        tourName?: string | null
    ): string {
        return getTourDisplayImageUrl(imageUrl, desName, cateName, tourName);
    }

    handleImageError(event: Event, desName?: string | null, cateName?: string | null, tourName?: string | null): void {
        handleTourImageError(event, desName, cateName, tourName);
    }

    goSearch(): void {
        this.router.navigate(['/tours/search'], {
            queryParams: this.searchDestination ? { destination: this.searchDestination } : {}
        });
    }

    loadTours(): void {
        this.loading = true;
        this.tourSvc.getAll(
            this.pagination.page,
            this.pagination.pageSize,
            this.filterCateId,
            this.filterDesId,
            this.filterDurationDays
        ).subscribe({
            next: res => {
                this.tours = res.items;
                this.pagination = res.pagination;
                this.loading = false;
                if (this.scrollToResults) {
                    this.scrollToResults = false;
                    setTimeout(() => document.getElementById('tour-results')?.scrollIntoView({ behavior: 'smooth' }), 50);
                }
            },
            error: () => this.loading = false
        });
    }

    onPageChange(page: number): void {
        this.pagination.page = page;
        this.loadTours();
    }
}
