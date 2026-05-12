import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables, ChartConfiguration } from 'chart.js';
import { ReportService } from '../../../services/report.service';
import { TourRevenueDto, MonthlyRevenueDto, PopularTourDto, OccupancyRateDto } from '../../../shared/models';

Chart.register(...registerables);

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BaseChartDirective],
  template: `
    <h3 class="mb-4"><i class="bi bi-file-earmark-bar-graph me-2"></i>Bao cao</h3>

    <!-- Revenue by Tour -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-header"><h5 class="mb-0">Doanh thu theo tour</h5></div>
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr><th>Tour</th><th>Diem den</th><th>So booking</th><th>Doanh thu</th></tr>
          </thead>
          <tbody>
            @for (r of tourRevenues; track r.tourId) {
              <tr>
                <td>{{ r.tourName }}</td>
                <td>{{ r.desName }}</td>
                <td>{{ r.totalBookings }}</td>
                <td class="fw-bold">{{ r.totalRevenue | number:'1.0-0' }} VND</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- Revenue by Month with Filter -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">Doanh thu theo thang</h5>
        <form [formGroup]="dateForm" (ngSubmit)="loadMonthly()" class="d-flex gap-2">
          <input type="date" class="form-control form-control-sm" formControlName="fromDate">
          <input type="date" class="form-control form-control-sm" formControlName="toDate">
          <button type="submit" class="btn btn-sm btn-primary">Loc</button>
        </form>
      </div>
      <div class="card-body">
        @if (monthlyChart.datasets[0].data.length > 0) {
          <canvas baseChart [data]="monthlyChart" [options]="chartOpts" type="bar"></canvas>
        } @else {
          <p class="text-muted text-center">Chua co du lieu.</p>
        }
      </div>
    </div>

    <!-- Popular Tours -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-header"><h5 class="mb-0">Tour pho bien</h5></div>
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr><th>#</th><th>Tour</th><th>Diem den</th><th>Rating TB</th><th>Luot dat</th></tr>
          </thead>
          <tbody>
            @for (p of popularTours; track p.tourId; let i = $index) {
              <tr>
                <td>{{ i + 1 }}</td>
                <td>{{ p.tourName }}</td>
                <td>{{ p.desName }}</td>
                <td>
                  <span class="text-warning">
                    @for (s of [1,2,3,4,5]; track s) {
                      <i class="bi" [class.bi-star-fill]="s <= p.avgRating"
                         [class.bi-star]="s > p.avgRating"></i>
                    }
                  </span>
                  {{ p.avgRating | number:'1.1-1' }}
                </td>
                <td>{{ p.totalBookings }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- Occupancy -->
    <div class="card border-0 shadow-sm">
      <div class="card-header"><h5 class="mb-0">Ty le lap day</h5></div>
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr><th>Tour</th><th>Ngay di</th><th>Tong</th><th>Da dat</th><th>Trong</th><th>Ty le</th></tr>
          </thead>
          <tbody>
            @for (o of occupancy; track o.scheduleId) {
              <tr>
                <td>{{ o.tourName }}</td>
                <td>{{ o.departureDate }}</td>
                <td>{{ o.totalSlots }}</td>
                <td>{{ o.bookedSlots }}</td>
                <td>{{ o.availableSlots }}</td>
                <td>
                  <div class="progress" style="height:20px">
                    <div class="progress-bar"
                         [class.bg-success]="o.occupancyPercent < 70"
                         [class.bg-warning]="o.occupancyPercent >= 70 && o.occupancyPercent < 90"
                         [class.bg-danger]="o.occupancyPercent >= 90"
                         [style.width.%]="o.occupancyPercent">
                      {{ o.occupancyPercent | number:'1.0-0' }}%
                    </div>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class ReportsComponent implements OnInit {
  tourRevenues: TourRevenueDto[] = [];
  monthlyRevenues: MonthlyRevenueDto[] = [];
  popularTours: PopularTourDto[] = [];
  occupancy: OccupancyRateDto[] = [];

  dateForm = this.fb.group({ fromDate: [''], toDate: [''] });

  monthlyChart: ChartConfiguration<'bar'>['data'] = {
    labels: [], datasets: [{ data: [], label: 'Doanh thu (VND)', backgroundColor: '#0d6efd' }]
  };
  chartOpts: ChartConfiguration<'bar'>['options'] = {
    responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } }
  };

  constructor(private fb: FormBuilder, private svc: ReportService) {}

  ngOnInit(): void {
    this.svc.getTourRevenue().subscribe(d => this.tourRevenues = d);
    this.svc.getPopularTours().subscribe(d => this.popularTours = d);
    this.svc.getOccupancy().subscribe(d => this.occupancy = d);
    this.loadMonthly();
  }

  loadMonthly(): void {
    const v = this.dateForm.value;
    this.svc.getRevenueByMonth(v.fromDate || undefined, v.toDate || undefined).subscribe(data => {
      this.monthlyRevenues = data;
      this.monthlyChart = {
        labels: data.map(d => `${d.revenueMonth}/${d.revenueYear}`),
        datasets: [{ data: data.map(d => d.totalRevenue), label: 'Doanh thu (VND)', backgroundColor: '#0d6efd' }]
      };
    });
  }
}
