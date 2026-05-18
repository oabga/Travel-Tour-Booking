-- ============================================================
--  migrate_tour_images.sql
--  Gán ảnh RIÊNG cho từng tour (theo TourId) — không trùng.
--  Chạy sau BACKUP.
-- ============================================================

USE TravelBookingDB;
GO

SET NOCOUNT ON;

UPDATE Tours SET ImageUrl = N'https://picsum.photos/seed/fansipan-trek-sapa/800/600'           WHERE TourId = 1;
UPDATE Tours SET ImageUrl = N'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&q=80' WHERE TourId = 2;
UPDATE Tours SET ImageUrl = N'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800&q=80' WHERE TourId = 3;
UPDATE Tours SET ImageUrl = N'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80' WHERE TourId = 4;
UPDATE Tours SET ImageUrl = N'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80' WHERE TourId = 5;
UPDATE Tours SET ImageUrl = N'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80' WHERE TourId = 6;
UPDATE Tours SET ImageUrl = N'https://picsum.photos/seed/dalat-lang-biang-pine/800/600'        WHERE TourId = 7;
UPDATE Tours SET ImageUrl = N'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80' WHERE TourId = 8;
UPDATE Tours SET ImageUrl = N'https://picsum.photos/seed/sapa-cat-cat-village/800/600'         WHERE TourId = 9;
UPDATE Tours SET ImageUrl = N'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80' WHERE TourId = 10;
UPDATE Tours SET ImageUrl = N'https://picsum.photos/seed/condao-trek-forest/800/600'           WHERE TourId = 11;
UPDATE Tours SET ImageUrl = N'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80' WHERE TourId = 12;

UPDATE Tours SET ImageUrl = N'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800&q=80' WHERE TourId = 13;
UPDATE Tours SET ImageUrl = N'https://picsum.photos/seed/dubai-marina-burj/800/600'            WHERE TourId = 14;
UPDATE Tours SET ImageUrl = N'https://picsum.photos/seed/santorini-caldera-sunset/800/600'    WHERE TourId = 15;
UPDATE Tours SET ImageUrl = N'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80' WHERE TourId = 16;
UPDATE Tours SET ImageUrl = N'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80' WHERE TourId = 17;
UPDATE Tours SET ImageUrl = N'https://picsum.photos/seed/danang-intercontinental-golf/800/600' WHERE TourId = 18;
UPDATE Tours SET ImageUrl = N'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80' WHERE TourId = 19;
UPDATE Tours SET ImageUrl = N'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80' WHERE TourId = 20;
UPDATE Tours SET ImageUrl = N'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80' WHERE TourId = 21;
UPDATE Tours SET ImageUrl = N'https://picsum.photos/seed/bali-ubud-villa-pool/800/600'        WHERE TourId = 22;
UPDATE Tours SET ImageUrl = N'https://images.unsplash.com/photo-1567894340315-735d7c361db0?w=800&q=80' WHERE TourId = 23;
UPDATE Tours SET ImageUrl = N'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&q=80' WHERE TourId = 24;

UPDATE Tours SET ImageUrl = N'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80' WHERE TourId = 25;
UPDATE Tours SET ImageUrl = N'https://picsum.photos/seed/dalat-strawberry-farm/800/600'       WHERE TourId = 26;
UPDATE Tours SET ImageUrl = N'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80' WHERE TourId = 27;
UPDATE Tours SET ImageUrl = N'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&q=80' WHERE TourId = 28;
UPDATE Tours SET ImageUrl = N'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80' WHERE TourId = 29;
UPDATE Tours SET ImageUrl = N'https://picsum.photos/seed/mytho-mekong-coconut-candy/800/600'  WHERE TourId = 30;
UPDATE Tours SET ImageUrl = N'https://picsum.photos/seed/fansipan-cable-car-sapa/800/600'      WHERE TourId = 31;
UPDATE Tours SET ImageUrl = N'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=800&q=80' WHERE TourId = 32;
UPDATE Tours SET ImageUrl = N'https://picsum.photos/seed/tam-dao-cloud-mountain/800/600'       WHERE TourId = 33;
UPDATE Tours SET ImageUrl = N'https://picsum.photos/seed/ba-na-golden-bridge/800/600'         WHERE TourId = 34;
UPDATE Tours SET ImageUrl = N'https://picsum.photos/seed/can-tho-floating-market/800/600'     WHERE TourId = 35;
UPDATE Tours SET ImageUrl = N'https://picsum.photos/seed/quy-nhon-eo-gio-family/800/600'       WHERE TourId = 36;

UPDATE Tours SET ImageUrl = N'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80' WHERE TourId = 37;
UPDATE Tours SET ImageUrl = N'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80' WHERE TourId = 38;
UPDATE Tours SET ImageUrl = N'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80' WHERE TourId = 39;
UPDATE Tours SET ImageUrl = N'https://picsum.photos/seed/quy-nhon-ky-co-beach/800/600'        WHERE TourId = 40;
UPDATE Tours SET ImageUrl = N'https://picsum.photos/seed/ly-son-garlic-island/800/600'        WHERE TourId = 41;
UPDATE Tours SET ImageUrl = N'https://picsum.photos/seed/condao-dam-trau-beach/800/600'      WHERE TourId = 42;
UPDATE Tours SET ImageUrl = N'https://picsum.photos/seed/phan-thiet-doi-duong-beach/800/600'   WHERE TourId = 43;
UPDATE Tours SET ImageUrl = N'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80' WHERE TourId = 44;
UPDATE Tours SET ImageUrl = N'https://picsum.photos/seed/hoi-an-an-bang-beach/800/600'        WHERE TourId = 45;
UPDATE Tours SET ImageUrl = N'https://picsum.photos/seed/ho-tram-long-hai-beach/800/600'     WHERE TourId = 46;
UPDATE Tours SET ImageUrl = N'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=80' WHERE TourId = 47;
UPDATE Tours SET ImageUrl = N'https://picsum.photos/seed/phu-quoc-nam-du-island/800/600'      WHERE TourId = 48;

SELECT ImageUrl, COUNT(*) AS Cnt FROM Tours GROUP BY ImageUrl HAVING COUNT(*) > 1;
SELECT T.TourId, T.TourName, LEFT(T.ImageUrl, 60) AS Img FROM Tours T WHERE T.TourId >= 37 ORDER BY T.TourId;

PRINT N'✅ migrate_tour_images.sql hoàn tất.';
GO
