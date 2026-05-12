import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CustomerProfile, UpdateProfileDto } from '../shared/models';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly url = `${environment.apiUrl}/accounts`;

  constructor(private http: HttpClient) {}

  getProfile(accountId: number): Observable<CustomerProfile> {
    return this.http.get<CustomerProfile>(`${this.url}/${accountId}/profile`);
  }

  updateProfile(accountId: number, dto: UpdateProfileDto): Observable<CustomerProfile> {
    return this.http.put<CustomerProfile>(`${this.url}/${accountId}/profile`, dto);
  }

  getBookingCount(accountId: number, year: number): Observable<{ accountId: number; year: number; bookingCount: number }> {
    return this.http.get<{ accountId: number; year: number; bookingCount: number }>(
      `${this.url}/${accountId}/booking-count`, { params: { year } }
    );
  }
}
