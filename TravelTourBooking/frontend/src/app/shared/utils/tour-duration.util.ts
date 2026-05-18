/** Hiển thị thời lượng trong sidebar bộ lọc (số ngày). */
export function formatDurationLabel(days: number): string {
  return String(days);
}

/** Nhãn mega menu / banner: thêm "Ngày" phía sau. */
export function formatDurationMenuLabel(days: number): string {
  return `${days} Ngày`;
}
