import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse, DestinationResponse, DestinationRequest } from '../shared/models';

@Injectable({ providedIn: 'root' })
export class DestinationService {
  private readonly url = `${environment.apiUrl}/destinations`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<DestinationResponse[]> {
    return this.http.get<ApiResponse<DestinationResponse[]>>(this.url)
      .pipe(map(r => r.data));
  }

  getById(id: number): Observable<DestinationResponse> {
    return this.http.get<ApiResponse<DestinationResponse>>(`${this.url}/${id}`)
      .pipe(map(r => r.data));
  }

  create(dto: DestinationRequest): Observable<DestinationResponse> {
    return this.http.post<ApiResponse<DestinationResponse>>(this.url, dto)
      .pipe(map(r => r.data));
  }

  update(id: number, dto: DestinationRequest): Observable<DestinationResponse> {
    return this.http.put<ApiResponse<DestinationResponse>>(`${this.url}/${id}`, dto)
      .pipe(map(r => r.data));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<ApiResponse<string>>(`${this.url}/${id}`)
      .pipe(map(() => void 0));
  }
}
