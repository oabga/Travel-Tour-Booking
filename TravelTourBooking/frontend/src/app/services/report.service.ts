import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  TourRevenueDto, MonthlyRevenueDto, PopularTourDto, OccupancyRateDto
} from '../shared/models';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly url = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  getTourRevenue(): Observable<TourRevenueDto[]> {
    return this.http.get<TourRevenueDto[]>(`${this.url}/revenue`);
  }

  getPopularTours(): Observable<PopularTourDto[]> {
    return this.http.get<PopularTourDto[]>(`${this.url}/popular-tours`);
  }

  getRevenueByMonth(fromDate?: string, toDate?: string): Observable<MonthlyRevenueDto[]> {
    let params = new HttpParams();
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);
    return this.http.get<MonthlyRevenueDto[]>(`${this.url}/revenue-by-month`, { params });
  }

  getOccupancy(): Observable<OccupancyRateDto[]> {
    return this.http.get<OccupancyRateDto[]>(`${this.url}/occupancy`);
  }
}
