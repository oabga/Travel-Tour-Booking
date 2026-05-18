import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ReviewDto, ReviewResponse } from '../shared/models';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly url = `${environment.apiUrl}/reviews`;

  constructor(private http: HttpClient) {}

  create(dto: ReviewDto): Observable<string> {
    return this.http.post(this.url, dto, { responseType: 'text' });
  }

  getByTour(tourId: number): Observable<ReviewResponse[]> {
    return this.http.get<ReviewResponse[]>(`${this.url}/tour/${tourId}`);
  }

  getRecent(limit = 6): Observable<ReviewResponse[]> {
    return this.http.get<ReviewResponse[]>(`${this.url}/recent`, {
      params: new HttpParams().set('limit', limit)
    });
  }
}
