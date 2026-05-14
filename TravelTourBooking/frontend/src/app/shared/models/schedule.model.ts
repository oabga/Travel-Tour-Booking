export interface ScheduleResponse {
  scheduleId: number;
  tourId: number | null;
  departureDate: string | null;
  returnDate: string | null;
  availableSlots: number;
  employeeId: number | null;
  employeeName: string | null;
  status: string | null;
}

export interface ScheduleRequest {
  tourId: number;
  departureDate: string;
  returnDate: string;
  availableSlots: number;
  employeeId?: number;
}
