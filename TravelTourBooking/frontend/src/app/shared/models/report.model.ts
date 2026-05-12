export interface TourRevenueDto {
  tourId: number;
  tourName: string;
  desName: string;
  totalBookings: number;
  totalRevenue: number;
}

export interface MonthlyRevenueDto {
  revenueYear: number;
  revenueMonth: number;
  totalBookings: number;
  totalRevenue: number;
  avgOrderValue: number;
}

export interface PopularTourDto {
  tourId: number;
  tourName: string;
  desName: string;
  avgRating: number;
  totalBookings: number;
}

export interface OccupancyRateDto {
  scheduleId: number;
  tourId: number;
  tourName: string;
  departureDate: string;
  totalSlots: number;
  bookedSlots: number;
  availableSlots: number;
  occupancyPercent: number;
}
