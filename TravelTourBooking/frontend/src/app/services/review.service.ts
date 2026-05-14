import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ReviewDto } from '../shared/models';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly url = `${environment.apiUrl}/reviews`;

  constructor(private http: HttpClient) {}

  create(dto: ReviewDto): Observable<string> {
    return this.http.post(this.url, dto, { responseType: 'text' });
  }
}
