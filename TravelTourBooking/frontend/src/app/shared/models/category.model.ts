export interface CategoryResponse {
  cateId: number;
  cateName: string;
  description: string | null;
}

export interface CategoryRequest {
  cateName: string;
  description?: string;
}
