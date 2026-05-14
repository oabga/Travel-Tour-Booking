import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse, ScheduleResponse, ScheduleRequest } from '../shared/models';

@Injectable({ providedIn: 'root' })
export class ScheduleService {
  private readonly url = `${environment.apiUrl}/schedules`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ScheduleResponse[]> {
    return this.http.get<ApiResponse<ScheduleResponse[]>>(this.url)
      .pipe(map(r => r.data));
  }

  getById(id: number): Observable<ScheduleResponse> {
    return this.http.get<ApiResponse<ScheduleResponse>>(`${this.url}/${id}`)
      .pipe(map(r => r.data));
  }

  getByTour(tourId: number): Observable<ScheduleResponse[]> {
    return this.http.get<ApiResponse<ScheduleResponse[]>>(`${this.url}/tour/${tourId}`)
      .pipe(map(r => r.data));
  }

  create(dto: ScheduleRequest): Observable<ScheduleResponse> {
    return this.http.post<ApiResponse<ScheduleResponse>>(this.url, dto)
      .pipe(map(r => r.data));
  }

  update(id: number, dto: ScheduleRequest): Observable<ScheduleResponse> {
    return this.http.put<ApiResponse<ScheduleResponse>>(`${this.url}/${id}`, dto)
      .pipe(map(r => r.data));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<ApiResponse<string>>(`${this.url}/${id}`)
      .pipe(map(() => void 0));
  }
}
