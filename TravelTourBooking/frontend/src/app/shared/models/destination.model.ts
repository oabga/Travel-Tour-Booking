export interface DestinationResponse {
  desId: number;
  desName: string | null;
  country: string | null;
  city: string | null;
  description: string | null;
}

export interface DestinationRequest {
  desName: string;
  country?: string;
  city?: string;
  description?: string;
}
