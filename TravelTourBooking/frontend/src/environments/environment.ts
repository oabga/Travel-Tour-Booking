/**
 * Ảnh tour: file trên API tại wwwroot/images/tours/ — URL DB dạng /images/tours/xxx.jpg
 * Phải trùng cổng profile API (https → 7008, http-only → 5002, IIS Express → 44393).
 */
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7008/api',
  imageBaseUrl: 'https://localhost:7008',
};
