/** Ảnh minh họa theo tên danh mục (Unsplash — cần mạng khi tải lần đầu). */
const CATEGORY_STOCK: Record<string, string> = {
  'Tour Miền Tây': 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80',
  'Tour Phan Thiết': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
  'Đà Nẵng': 'https://images.unsplash.com/photo-1555881400-632adc7acd64?w=800&q=80',
  'Phú Quốc': 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
  'Miền Bắc': 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&q=80',
  'Đà Lạt': 'https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=800&q=80',
  'Hồ Chí Minh': 'https://images.unsplash.com/photo-1583417319070-097bb00109c1?w=800&q=80',
  'Tour Đảo': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'Nha Trang': 'https://images.unsplash.com/photo-1519046909882-ff06bbed8696?w=800&q=80',
  'Tour nước ngoài': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80',
};

const DESTINATION_STOCK: Record<string, string> = {
  'đà lạt': 'https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=800&q=80',
  'phú quốc': 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
  'nha trang': 'https://images.unsplash.com/photo-1519046909882-ff06bbed8696?w=800&q=80',
  'đà nẵng': 'https://images.unsplash.com/photo-1555881400-632adc7acd64?w=800&q=80',
  'hà nội': 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&q=80',
  'bangkok': 'https://images.unsplash.com/photo-1563492065-73a5c03fde12?w=800&q=80',
};

const DEFAULT_STOCK =
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80';

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
