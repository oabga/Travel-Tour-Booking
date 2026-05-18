-- Migration: Danh mục tour mega menu + destinations mở rộng
-- Chạy trên TravelBookingDB sau khi BACKUP
-- Dùng khi DB đã có dữ liệu cũ (Adventure, Luxury, ...)
--
-- Cảnh báo: Nếu đã chạy seed_reset_catalog_and_tours.sql (chỉ còn 4 danh mục
-- Adventure / Luxury / Family / Beach) thì không nên chạy script này nguyên bản —
-- nó thêm danh mục theo địa danh và UPDATE CateId tour, có thể làm lệch dữ liệu.
-- Chỉ chạy lại sau khi đã chỉnh script cho phù hợp mô hình mới.

USE TravelBookingDB;
GO

-- Thêm danh mục mới (bỏ qua nếu đã tồn tại theo tên)
IF NOT EXISTS (SELECT 1 FROM Categories WHERE CateName = N'Tour Miền Tây')
    INSERT INTO Categories (CateName, Description) VALUES (N'Tour Miền Tây', N'Tour khám phá miền Tây');
IF NOT EXISTS (SELECT 1 FROM Categories WHERE CateName = N'Tour Phan Thiết')
    INSERT INTO Categories (CateName, Description) VALUES (N'Tour Phan Thiết', N'Tour biển Phan Thiết');
IF NOT EXISTS (SELECT 1 FROM Categories WHERE CateName = N'Đà Nẵng')
    INSERT INTO Categories (CateName, Description) VALUES (N'Đà Nẵng', N'Tour Đà Nẵng');
IF NOT EXISTS (SELECT 1 FROM Categories WHERE CateName = N'Phú Quốc')
    INSERT INTO Categories (CateName, Description) VALUES (N'Phú Quốc', N'Tour đảo Phú Quốc');
IF NOT EXISTS (SELECT 1 FROM Categories WHERE CateName = N'Miền Bắc')
    INSERT INTO Categories (CateName, Description) VALUES (N'Miền Bắc', N'Tour miền Bắc');
IF NOT EXISTS (SELECT 1 FROM Categories WHERE CateName = N'Đà Lạt')
    INSERT INTO Categories (CateName, Description) VALUES (N'Đà Lạt', N'Tour Đà Lạt');
IF NOT EXISTS (SELECT 1 FROM Categories WHERE CateName = N'Hồ Chí Minh')
    INSERT INTO Categories (CateName, Description) VALUES (N'Hồ Chí Minh', N'Tour TP.HCM');
IF NOT EXISTS (SELECT 1 FROM Categories WHERE CateName = N'Tour Đảo')
    INSERT INTO Categories (CateName, Description) VALUES (N'Tour Đảo', N'Tour đảo');
IF NOT EXISTS (SELECT 1 FROM Categories WHERE CateName = N'Nha Trang')
    INSERT INTO Categories (CateName, Description) VALUES (N'Nha Trang', N'Tour Nha Trang');
GO

-- Gán lại CateId cho tour mẫu (theo tên tour)
UPDATE T SET CateId = C.CateId
FROM Tours T
INNER JOIN Categories C ON C.CateName = N'Đà Lạt'
WHERE T.TourName LIKE N'%Đà Lạt%';

UPDATE T SET CateId = C.CateId
FROM Tours T
INNER JOIN Categories C ON C.CateName = N'Phú Quốc'
WHERE T.TourName LIKE N'%Phú Quốc%';

UPDATE T SET CateId = C.CateId
FROM Tours T
INNER JOIN Categories C ON C.CateName = N'Nha Trang'
WHERE T.TourName LIKE N'%Nha Trang%';

UPDATE T SET CateId = C.CateId
FROM Tours T
INNER JOIN Categories C ON C.CateName = N'Miền Bắc'
WHERE T.TourName LIKE N'%Bangkok%';
GO

PRINT N'Hoàn tất migration danh mục mega menu.';
