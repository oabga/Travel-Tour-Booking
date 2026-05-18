import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { ReportService } from '../../../services/report.service';
import { MonthlyRevenueDto, PopularTourDto, TourRevenueDto, OccupancyRateDto } from '../../../shared/models';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <h3 class="mb-4"><i class="bi bi-bar-chart-line me-2"></i>Dashboard</h3>

    <!-- Stats Cards -->
    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="card border-0 shadow-sm text-center p-3">
          <i class="bi bi-cash-stack fs-1 text-success"></i>
          <h4 class="mt-2">{{ totalRevenue | number:'1.0-0' }}</h4>
          <small class="text-muted">Tổng doanh thu (VND)</small>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm text-center p-3">
          <i class="bi bi-journal-check fs-1 text-primary"></i>
          <h4 class="mt-2">{{ totalBookings }}</h4>
          <small class="text-muted">Tổng booking</small>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm text-center p-3">
          <i class="bi bi-map fs-1 text-info"></i>
          <h4 class="mt-2">{{ tourRevenues.length }}</h4>
          <small class="text-muted">Tours có doanh thu</small>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm text-center p-3">
          <i class="bi bi-star fs-1 text-warning"></i>
          <h4 class="mt-2">{{ popularTours.length }}</h4>
          <small class="text-muted">Tour phổ biến</small>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="row g-4 mb-4">
      <div class="col-lg-8">
        <div class="card border-0 shadow-sm">
          <div class="card-header"><h5 class="mb-0">Doanh thu theo tháng</h5></div>
          <div class="card-body">
            @if (monthlyChartData.datasets[0].data.length > 0) {
              <canvas baseChart
                      [data]="monthlyChartData"
                      [options]="barOptions"
                      type="bar"></canvas>
            } @else {
              <p class="text-muted text-center py-4">Chưa có dữ liệu.</p>
            }
          </div>
        </div>
      </div>
      <div class="col-lg-4">
        <div class="card border-0 shadow-sm">
          <div class="card-header"><h5 class="mb-0">Tour phổ biến</h5></div>
          <div class="card-body">
            @if (popularChartData.datasets[0].data.length > 0) {
              <canvas baseChart
                      [data]="popularChartData"
                      [options]="pieOptions"
                      type="doughnut"></canvas>
            } @else {
              <p class="text-muted text-center py-4">Chưa có dữ liệu.</p>
            }
          </div>
        </div>
      </div>
    </div>

    <!-- Occupancy Table -->
    <div class="card border-0 shadow-sm">
      <div class="card-header"><h5 class="mb-0">Tỷ lệ lấp đầy (Occupancy Rate)</h5></div>
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th>Tour</th>
              <th>Ngày đi</th>
              <th>Tổng chỗ</th>
              <th>Đã đặt</th>
              <th>Còn trống</th>
              <th>Tỷ lệ</th>
            </tr>
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
export class DashboardComponent implements OnInit {
  tourRevenues: TourRevenueDto[] = [];
  monthlyRevenues: MonthlyRevenueDto[] = [];
  popularTours: PopularTourDto[] = [];
  occupancy: OccupancyRateDto[] = [];
  totalRevenue = 0;
  totalBookings = 0;

  monthlyChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{ data: [], label: 'Doanh thu (VND)', backgroundColor: '#0d6efd' }]
  };

  popularChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#6f42c1',
                         '#0dcaf0', '#fd7e14', '#20c997', '#6610f2', '#d63384']
    }]
  };

  barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } }
  };

  pieOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    plugins: { legend: { position: 'bottom' } }
  };

  constructor(private reportSvc: ReportService) {}

  ngOnInit(): void {
    this.reportSvc.getTourRevenue().subscribe(data => {
      this.tourRevenues = data;
      this.totalRevenue = data.reduce((s, d) => s + d.totalRevenue, 0);
      this.totalBookings = data.reduce((s, d) => s + d.totalBookings, 0);
    });

    this.reportSvc.getRevenueByMonth().subscribe(data => {
      this.monthlyRevenues = data;
      this.monthlyChartData = {
        labels: data.map(d => `${d.revenueMonth}/${d.revenueYear}`),
        datasets: [{
          data: data.map(d => d.totalRevenue),
          label: 'Doanh thu (VND)',
          backgroundColor: '#0d6efd'
        }]
      };
    });

    this.reportSvc.getPopularTours().subscribe(data => {
      this.popularTours = data;
      this.popularChartData = {
        labels: data.map(d => d.tourName),
        datasets: [{
          data: data.map(d => d.totalBookings),
          backgroundColor: ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#6f42c1',
                           '#0dcaf0', '#fd7e14', '#20c997', '#6610f2', '#d63384']
        }]
      };
    });

    this.reportSvc.getOccupancy().subscribe(data => this.occupancy = data);
  }
}
