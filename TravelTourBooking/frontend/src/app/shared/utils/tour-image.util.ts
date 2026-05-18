import { environment } from '../../../environments/environment';
import { getCategoryStockImage, getDestinationStockImage } from './category-image.util';

export const DEFAULT_TOUR_IMAGE = '/assets/images/default-tour.svg';

/**
 * Ảnh tour thật: API lưu đường dẫn tương đối (vd. /images/tours/xxx.jpg)
 * và file nằm tại TravelTourBooking.API/wwwroot/images/tours/
 */
export function resolveTourImageUrl(
  imageUrl: string | null | undefined
): string | null {
  if (!imageUrl?.trim()) return null;
  const path = imageUrl.trim();
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const base = environment.imageBaseUrl.replace(/\/$/, '');
  return path.startsWith('/') ? `${base}${path}` : `${base}/${path}`;
}

/** URL hiển thị: ảnh upload → nếu không có thì ảnh stock theo điểm đến/danh mục. */
export function getTourDisplayImageUrl(
  imageUrl: string | null | undefined,
  desName?: string | null,
  cateName?: string | null
): string {
  const resolved = resolveTourImageUrl(imageUrl);
  if (resolved) return resolved;
  if (desName) return getDestinationStockImage(desName);
  if (cateName) return getCategoryStockImage(cateName);
  return DEFAULT_TOUR_IMAGE;
}
