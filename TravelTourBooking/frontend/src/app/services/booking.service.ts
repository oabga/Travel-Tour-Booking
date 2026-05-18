import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ApiResponse, CreateBookingRequest, BookingResponse,
  BookingDetailView, BookingHistory, PaymentSession, ExpirePaymentSessionResult
} from '../shared/models';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly url = `${environment.apiUrl}/bookings`;

  constructor(private http: HttpClient) {}

  create(dto: CreateBookingRequest): Observable<BookingResponse> {
    return this.http.post<ApiResponse<BookingResponse>>(this.url, dto)
      .pipe(map(r => r.data));
  }

  getById(id: number): Observable<BookingDetailView> {
    return this.http.get<ApiResponse<BookingDetailView>>(`${this.url}/${id}`)
      .pipe(map(r => r.data));
  }

  cancel(id: number): Observable<void> {
    return this.http.put<ApiResponse<string>>(`${this.url}/${id}/cancel`, {})
      .pipe(map(() => void 0));
  }

  getByAccount(accountId: number): Observable<BookingHistory[]> {
    return this.http.get<ApiResponse<BookingHistory[]>>(`${this.url}/account/${accountId}`)
      .pipe(map(r => r.data));
  }

  getAll(): Observable<BookingHistory[]> {
    return this.http.get<ApiResponse<BookingHistory[]>>(`${this.url}/all`)
      .pipe(map(r => r.data));
  }

  startPaymentSession(bookingId: number): Observable<PaymentSession> {
    return this.http.post<ApiResponse<PaymentSession>>(`${this.url}/${bookingId}/start-payment-session`, {})
      .pipe(map(r => r.data));
  }

  expirePaymentSession(bookingId: number): Observable<ExpirePaymentSessionResult> {
    return this.http.post<ApiResponse<ExpirePaymentSessionResult>>(`${this.url}/${bookingId}/expire-payment-session`, {})
      .pipe(map(r => r.data));
  }
}
