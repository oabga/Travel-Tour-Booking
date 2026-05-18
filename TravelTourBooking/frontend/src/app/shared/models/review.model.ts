export interface ReviewDto {
  tourId: number;
  rating: number;
  comment?: string;
}

export interface ReviewResponse {
  reviewId: number;
  rating: number;
  comment?: string | null;
  reviewDate: string;
  userName: string;
  tourId: number;
  tourName?: string | null;
}
