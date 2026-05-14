import { ScheduleResponse } from './schedule.model';

export interface TourRequest {
  tourName: string;
  cateId: number;
  desId: number;
  durationDays: number;
  price: number;
  maxCapacity: number;
  description?: string;
  imageUrl?: string;
}

export interface TourList {
  tourId: number;
  tourName: string;
  price: number;
  durationDays: number;
  maxCapacity: number;
  imageUrl: string | null;
  cateName: string | null;
  desName: string | null;
  avgRating: number | null;
}

export interface TourDetail {
  tourId: number;
  tourName: string;
  price: number;
  durationDays: number;
  maxCapacity: number;
  description: string | null;
  imageUrl: string | null;
  cateName: string | null;
  desName: string | null;
  country: string | null;
  city: string | null;
  avgRating: number | null;
  totalReviews: number;
  schedules: ScheduleResponse[];
}

export interface SearchTourResult {
  tourId: number;
  tourName: string;
  price: number;
  durationDays: number;
  imageUrl: string | null;
  desName: string | null;
  cateName: string | null;
  departureDate: string | null;
  availableSlots: number;
}

export interface PopularTourResult {
  tourId: number;
  tourName: string;
  desName: string | null;
  avgRating: number;
  totalBookings: number;
}
