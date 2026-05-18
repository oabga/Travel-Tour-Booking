import { environment } from '../../../environments/environment';
import { getCategoryStockImage, getDestinationStockImage } from './category-image.util';
import { getTourStockByName } from './tour-stock-images';

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

/** URL hiển thị: ảnh DB → stock theo tên tour → điểm đến → danh mục. */
export function getTourDisplayImageUrl(
  imageUrl: string | null | undefined,
  desName?: string | null,
  cateName?: string | null,
  tourName?: string | null
): string {
  const resolved = resolveTourImageUrl(imageUrl);
  if (resolved) return resolved;
  const byTour = getTourStockByName(tourName);
  if (byTour) return byTour;
  if (desName) return getDestinationStockImage(desName);
  if (cateName) return getCategoryStockImage(cateName);
  return DEFAULT_TOUR_IMAGE;
}

/** Khi ảnh chính lỗi: thử stock theo tên tour / điểm đến / danh mục. */
export function handleTourImageError(
  event: Event,
  desName?: string | null,
  cateName?: string | null,
  tourName?: string | null
): void {
  const img = event.target as HTMLImageElement;
  const fallback = getTourStockByName(tourName)
    ?? (desName ? getDestinationStockImage(desName) : null)
    ?? (cateName ? getCategoryStockImage(cateName) : null)
    ?? DEFAULT_TOUR_IMAGE;

  if (img.src === fallback || img.src.endsWith(DEFAULT_TOUR_IMAGE)) return;
  img.src = fallback;
}
