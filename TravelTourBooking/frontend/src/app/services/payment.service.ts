import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  PaymentDto,
  CreatePaymentDto,
  CreateCashPaymentDto,
  CheckoutPaymentResult,
  PaymentConfig,
  SubmitPaymentResult,
  ConfirmPaymentResult
} from '../shared/models';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly url = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  getConfig(): Observable<PaymentConfig> {
    return this.http.get<PaymentConfig>(`${this.url}/config`);
  }

  submit(dto: CreatePaymentDto): Observable<SubmitPaymentResult> {
    return this.http.post<SubmitPaymentResult>(`${this.url}/submit`, dto);
  }

  checkout(dto: CreatePaymentDto): Observable<CheckoutPaymentResult> {
    return this.http.post<CheckoutPaymentResult>(`${this.url}/checkout`, dto);
  }

  createBankTransfer(dto: CreatePaymentDto): Observable<number> {
    return this.http.post<number>(
      `${this.url}/bank-transfer`,
      dto
    );
  }

  createCashPayment(dto: CreateCashPaymentDto): Observable<number> {
    return this.http.post<number>(
      `${this.url}/cash`,
      dto
    );
  }
  
  confirm(id: number): Observable<ConfirmPaymentResult> {
    return this.http.put<ConfirmPaymentResult>(`${this.url}/${id}/confirm`, {});
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
