import { CATEGORY_IMAGE, DESTINATION_IMAGE, TOUR_STOCK } from './tour-stock-images';

/** Ảnh minh họa theo danh mục / điểm đến (Unsplash — URL đã kiểm tra). */
const CATEGORY_STOCK: Record<string, string> = {
  ...CATEGORY_IMAGE,
  'Tour Miền Tây': TOUR_STOCK.heritage,
  'Tour Phan Thiết': TOUR_STOCK.phanThiet,
  'Đà Nẵng': TOUR_STOCK.coastRoad,
  'Phú Quốc': TOUR_STOCK.phuQuocBeach,
  'Miền Bắc': TOUR_STOCK.trek,
  'Đà Lạt': TOUR_STOCK.dalat,
  'Hồ Chí Minh': TOUR_STOCK.city,
  'Tour Đảo': TOUR_STOCK.islandAerial,
  'Nha Trang': TOUR_STOCK.beachTropical,
  'Tour nước ngoài': TOUR_STOCK.city,
};

const DESTINATION_STOCK: Record<string, string> = {
  ...DESTINATION_IMAGE,
};

const DEFAULT_STOCK = TOUR_STOCK.default;

/** Ảnh cho khối Biển đảo / Núi rừng / Di sản trên trang chủ. */
export const PROMO_GALLERY_IMAGES = {
  beach: TOUR_STOCK.beachSunset,
  mountain: TOUR_STOCK.mountain,
  heritage: TOUR_STOCK.heritage,
} as const;

export function getCategoryStockImage(cateName: string): string {
  const exact = CATEGORY_STOCK[cateName.trim()];
  if (exact) return exact;
  const key = Object.keys(CATEGORY_STOCK).find(
    k => k.toLowerCase() === cateName.trim().toLowerCase()
  );
  return key ? CATEGORY_STOCK[key] : DEFAULT_STOCK;
}

export function getDestinationStockImage(desName: string | null | undefined): string {
  if (!desName) return DEFAULT_STOCK;
  const lower = desName.trim().toLowerCase();
  const key = Object.keys(DESTINATION_STOCK).find(k => lower.includes(k));
  return key ? DESTINATION_STOCK[key] : DEFAULT_STOCK;
}

export function buildImageLayer(
  imageUrl: string,
  overlay = 'linear-gradient(to top, rgba(0,0,0,.72) 0%, rgba(0,0,0,.25) 55%, rgba(0,0,0,.1) 100%)'
): string {
  return `${overlay}, url('${imageUrl}') center/cover no-repeat`;
}
