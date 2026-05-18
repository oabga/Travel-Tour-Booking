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
  amount?: number;
  paymentMethod?: string;
  transactionCode?: string;
}

export interface PaymentSession {
  bookingId: number;
  deadlineUtc?: string | null;
  remainingSeconds: number;
  amountDue: number;
  expired?: boolean;
  cancelled?: boolean;
  message?: string | null;
}

export interface ExpirePaymentSessionResult {
  expired: boolean;
  cancelled: boolean;
  message?: string | null;
}

export interface CreateCashPaymentDto {
  bookingId: number;
  amount: number;
}

export interface CheckoutPaymentResult {
  paymentId: number;
  bookingConfirmed: boolean;
  emailSent: boolean;
  remainingAmount: number;
  message: string;
}

export interface PaymentConfig {
  moMoQrUrl: string;
  moMoAccountName: string;
  moMoPhone: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  transferNotePrefix: string;
}

export interface SubmitPaymentResult {
  paymentId: number;
  status: string;
  amountExpected?: number;
  emailSent: boolean;
  emailError?: string | null;
  message: string;
}

export interface ConfirmPaymentResult {
  success: boolean;
  bookingConfirmed: boolean;
  emailSent: boolean;
  remainingAmount: number;
  paymentMatch?: string | null;
  message: string;
}

export interface RejectPaymentResult {
  success: boolean;
  message: string;
}
