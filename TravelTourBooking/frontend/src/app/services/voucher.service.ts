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

@Injectable({ providedIn: 'root' })
export class VoucherService {
  private readonly url = `${environment.apiUrl}/vouchers`;

  constructor(private http: HttpClient) {}

  validate(code: string): Observable<VoucherValidation> {
    return this.http.get<ApiResponse<VoucherValidation>>(`${this.url}/validate/${code}`)
      .pipe(map(r => r.data));
  }
}
