import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../shared/models';

export interface VoucherValidation {
  code: string;
  discountPercent: number;
  message: string;
  isValid: boolean;
}

export interface Voucher {
  voucherId: number;
  code: string;
  discountPercent: number;
  startDate: string;
  endDate: string;
  maxUsage: number;
  usedCount: number;
}

@Injectable({ providedIn: 'root' })
export class VoucherService {
  private readonly url = `${environment.apiUrl}/vouchers`;

  constructor(private http: HttpClient) { }

  validate(code: string): Observable<VoucherValidation> {
    return this.http.get<ApiResponse<VoucherValidation>>(`${this.url}/validate/${code}`)
      .pipe(map(r => r.data));
  }

  getAll(): Observable<Voucher[]> {
    return this.http.get<ApiResponse<Voucher[]>>(this.url)
      .pipe(map(r => r.data));
  }

  getById(id: number): Observable<Voucher> {
    return this.http.get<ApiResponse<Voucher>>(`${this.url}/${id}`)
      .pipe(map(r => r.data));
  }

  create(voucher: Partial<Voucher>): Observable<Voucher> {
    return this.http.post<ApiResponse<Voucher>>(this.url, voucher)
      .pipe(map(r => r.data));
  }

  update(id: number, voucher: Partial<Voucher>): Observable<Voucher> {
    return this.http.put<ApiResponse<Voucher>>(`${this.url}/${id}`, voucher)
      .pipe(map(r => r.data));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<ApiResponse<string>>(`${this.url}/${id}`)
      .pipe(map(() => void 0));
  }
}
