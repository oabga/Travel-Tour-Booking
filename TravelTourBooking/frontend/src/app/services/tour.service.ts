import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ApiResponse, PagedResult,
  TourList, TourDetail, TourRequest, SearchTourResult, PopularTourResult
} from '../shared/models';

@Injectable({ providedIn: 'root' })
export class TourService {
  private readonly url = `${environment.apiUrl}/tours`;

  constructor(private http: HttpClient) {}

  getAll(page = 1, pageSize = 10, cateId?: number, desId?: number,
         priceMin?: number, priceMax?: number): Observable<PagedResult<TourList>> {
    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);
    if (cateId) params = params.set('cateId', cateId);
    if (desId) params = params.set('desId', desId);
    if (priceMin != null) params = params.set('priceMin', priceMin);
    if (priceMax != null) params = params.set('priceMax', priceMax);

    return this.http.get<ApiResponse<PagedResult<TourList>>>(this.url, { params })
      .pipe(map(r => r.data));
  }

  getById(id: number): Observable<TourDetail> {
    return this.http.get<ApiResponse<TourDetail>>(`${this.url}/${id}`)
      .pipe(map(r => r.data));
  }

  search(destination?: string, priceMin?: number, priceMax?: number,
         date?: string): Observable<SearchTourResult[]> {
    let params = new HttpParams();
    if (destination) params = params.set('destination', destination);
    if (priceMin != null) params = params.set('priceMin', priceMin);
    if (priceMax != null) params = params.set('priceMax', priceMax);
    if (date) params = params.set('date', date);

    return this.http.get<ApiResponse<SearchTourResult[]>>(`${this.url}/search`, { params })
      .pipe(map(r => r.data));
  }

  getPopular(): Observable<PopularTourResult[]> {
    return this.http.get<ApiResponse<PopularTourResult[]>>(`${this.url}/popular`)
      .pipe(map(r => r.data));
  }

  create(dto: TourRequest): Observable<TourDetail> {
    return this.http.post<ApiResponse<TourDetail>>(this.url, dto)
      .pipe(map(r => r.data));
  }

  update(id: number, dto: TourRequest): Observable<TourDetail> {
    return this.http.put<ApiResponse<TourDetail>>(`${this.url}/${id}`, dto)
      .pipe(map(r => r.data));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<ApiResponse<string>>(`${this.url}/${id}`)
      .pipe(map(() => void 0));
  }
}
