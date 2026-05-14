export interface CreateBookingRequest {
  accountId: number;
  scheduleId: number;
  numberOfPeople: number;
  discountPercent: number;
  notes?: string;
  passengers: PassengerDto[];
}

export interface PassengerDto {
  passengerName: string;
  passengerDOB?: string;
  passengerPhone?: string;
  isPrimaryContact: boolean;
  passengerType: 'Adult' | 'Child';
  passengerIdNumber?: string;
}

export interface BookingResponse {
  bookingId: number;
  accountId: number | null;
  scheduleId: number | null;
  bookingDate: string;
  numberOfPeople: number;
  totalAmount: number | null;
  discountPercent: number;
  status: string | null;
  notes: string | null;
  passengers: PassengerResponse[];
}

export interface PassengerResponse {
  detailId: number;
  passengerName: string | null;
  passengerDOB: string | null;
  passengerPhone: string | null;
  isPrimaryContact: boolean;
  passengerType: string | null;
  passengerIdNumber: string | null;
}

export interface BookingDetailView {
  bookingId: number;
  userName: string | null;
  userPhone: string | null;
  userEmail: string | null;
  tourName: string | null;
  desName: string | null;
  departureDate: string | null;
  returnDate: string | null;
  numberOfPeople: number;
  totalAmount: number | null;
  discountPercent: number;
  bookingStatus: string | null;
  bookingDate: string;
  notes: string | null;
  passengers: PassengerResponse[];
}

export interface BookingHistory {
  bookingId: number;
  tourName: string | null;
  desName: string | null;
  departureDate: string | null;
  numberOfPeople: number;
  totalAmount: number | null;
  status: string | null;
  bookingDate: string;
}
