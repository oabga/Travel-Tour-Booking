export interface PaymentDto {
  paymentId: number;
  bookingId: number;
  amount: number;
  paymentDate: string;
  paymentMethod: string | null;
  status: string | null;
  invoiceCode: string | null;
  transactionCode: string | null;
}

export interface CreatePaymentDto {
  bookingId: number;
  amount: number;
  paymentMethod?: string;
  status?: string;
  transactionCode?: string;
}
