import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PaymentDto, CreatePaymentDto } from '../shared/models';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly url = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  create(dto: CreatePaymentDto): Observable<number> {
    return this.http.post<number>(this.url, dto);
  }

  getByBooking(bookingId: number): Observable<PaymentDto[]> {
    return this.http.get<PaymentDto[]>(`${this.url}/booking/${bookingId}`);
  }

  getTotalPaid(bookingId: number): Observable<number> {
    return this.http.get<number>(`${this.url}/booking/${bookingId}/total-paid`);
  }

  getRemaining(bookingId: number): Observable<number> {
    return this.http.get<number>(`${this.url}/booking/${bookingId}/remaining`);
  }
}
