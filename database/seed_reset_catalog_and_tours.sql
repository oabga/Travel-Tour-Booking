-- ============================================================
--  seed_reset_catalog_and_tours.sql
--  Xóa dữ liệu nghiệp vụ + catalog, GIỮ Accounts/Roles/Profiles/Employees.
--  Seed 4 danh mục, 26 điểm đến, 48 tour với ImageUrl Unsplash (khớp chủ đề).
--
--  BƯỚC 0 (bắt buộc thủ công): BACKUP DATABASE
--    BACKUP DATABASE TravelBookingDB TO DISK = N'C:\Backup\TravelBookingDB.bak'
--      WITH FORMAT, INIT, NAME = N'TravelBookingDB full backup';
-- ============================================================

SET NOCOUNT ON;
GO

USE TravelBookingDB;
GO

SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRAN;

    DELETE FROM Reviews;
    DELETE FROM Payments;
    DELETE FROM BookingDetails;
    DELETE FROM Bookings;
    DELETE FROM TourSchedules;
    DELETE FROM Tours;
    DELETE FROM Categories;
    DELETE FROM Destinations;

    IF NOT EXISTS (SELECT 1 FROM Employees)
    BEGIN
        INSERT INTO Employees (FullName, Role, Phone, Email)
        VALUES
            (N'Hệ thống Guide', N'Guide', N'0900000001', N'guide_seed@traveltour.local'),
            (N'Hệ thống Manager', N'Manager', N'0900000002', N'manager_seed@traveltour.local');
    END;

    DECLARE @EmpId INT = (SELECT MIN(EmployeeId) FROM Employees);

    DBCC CHECKIDENT ('Categories', RESEED, 0);
    DBCC CHECKIDENT ('Destinations', RESEED, 0);
    DBCC CHECKIDENT ('Tours', RESEED, 0);
    DBCC CHECKIDENT ('TourSchedules', RESEED, 0);

    INSERT INTO Categories (CateName, Description) VALUES
        (N'Adventure', N'Tour mạo hiểm: trekking, leo núi, hang động.'),
        (N'Luxury',    N'Tour cao cấp: resort 5 sao, dịch vụ riêng.'),
        (N'Family',    N'Tour gia đình: an toàn, vui chơi đa thế hệ.'),
        (N'Beach',     N'Tour biển đảo: nghỉ dưỡng, tắm biển.');

    DECLARE @CAdv   INT = (SELECT CateId FROM Categories WHERE CateName = N'Adventure');
    DECLARE @CLux   INT = (SELECT CateId FROM Categories WHERE CateName = N'Luxury');
    DECLARE @CFam   INT = (SELECT CateId FROM Categories WHERE CateName = N'Family');
    DECLARE @CBeach INT = (SELECT CateId FROM Categories WHERE CateName = N'Beach');

    /* DesId 25 = Quảng Bình, 26 = Cát Bà */
    INSERT INTO Destinations (DesName, Country, City, Description) VALUES
        (N'Đà Lạt',       N'Việt Nam', N'Lâm Đồng',     N'Cao nguyên'),
        (N'Sa Pa',        N'Việt Nam', N'Lào Cai',     N'Tây Bắc'),
        (N'Hạ Long',      N'Việt Nam', N'Quảng Ninh',  N'Vịnh di sản'),
        (N'Phú Quốc',     N'Việt Nam', N'Kiên Giang',  N'Đảo ngọc'),
        (N'Nha Trang',    N'Việt Nam', N'Khánh Hòa',  N'Biển xanh'),
        (N'Đà Nẵng',      N'Việt Nam', N'Đà Nẵng',     N'Thành phố biển'),
        (N'Hội An',       N'Việt Nam', N'Quảng Nam',  N'Phố cổ'),
        (N'Mũi Né',       N'Việt Nam', N'Bình Thuận', N'Biển và cồn cát'),
        (N'Maldives',     N'Maldives', N'Malé',        N'Resort biển'),
        (N'Dubai',        N'UAE',      N'Dubai',      N'Đô thị xa hoa'),
        (N'Santorini',    N'Hy Lạp',   N'Santorini',  N'Đảo biển Aegean'),
        (N'Phuket',       N'Thái Lan', N'Phuket',     N'Đảo nhiệt đới'),
        (N'Bali',         N'Indonesia',N'Denpasar',   N'Văn hóa & biển'),
        (N'Tokyo',        N'Nhật Bản', N'Tokyo',      N'Đô thị hiện đại'),
        (N'Seoul',        N'Hàn Quốc', N'Seoul',      N'Văn hóa K-pop'),
        (N'Paris',        N'Pháp',     N'Paris',       N'Châu Âu cổ điển'),
        (N'Singapore',    N'Singapore',N'Singapore',  N'Thành phố sạch'),
        (N'Bangkok',      N'Thái Lan', N'Bangkok',     N'Chùa và ẩm thực'),
        (N'Quy Nhơn',     N'Việt Nam', N'Bình Định',  N'Eo Gió'),
        (N'Lý Sơn',       N'Việt Nam', N'Quảng Ngãi', N'Đảo tiêu'),
        (N'Côn Đảo',      N'Việt Nam', N'Bà Rịa-Vũng Tàu', N'Biển hoang sơ'),
        (N'Phan Thiết',   N'Việt Nam', N'Bình Thuận', N'Biển Nam Trung Bộ'),
        (N'Huế',          N'Việt Nam', N'Thừa Thiên Huế', N'Cố đô'),
        (N'Cần Thơ',      N'Việt Nam', N'Cần Thơ',     N'Miền Tây sông nước'),
        (N'Quảng Bình',   N'Việt Nam', N'Quảng Bình', N'Phong Nha – Kẻ Bàng'),
        (N'Cát Bà',       N'Việt Nam', N'Hải Phòng',  N'Vườn quốc gia biển đảo');

    INSERT INTO Tours (TourName, CateId, DesId, DurationDays, Price, MaxCapacity, Description, ImageUrl, IsActive) VALUES
        (N'Fansipan Trek 2N1Đ',           @CAdv, 2,  2,  3200000, 22, N'Leo đỉnh Fansipan, chợ tình Sa Pa.',                    N'https://picsum.photos/seed/fansipan-trek-sapa/800/600', 1),
        (N'Hồ Ba Bể – Thác Đầu Đẳng 3N2Đ', @CAdv, 2,  3,  2800000, 24, N'Kayak hồ, homestay bản làng.',                          N'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&q=80', 1),
        (N'Hang Én – Quảng Bình 4N3Đ',    @CAdv, 25, 4,  6500000, 18, N'Trek hang động Phong Nha – Kẻ Bàng.',                   N'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800&q=80', 1),
        (N'Cát Bà Trek & Leo núi 2N1Đ',  @CAdv, 26,  2,  2400000, 20, N'Vườn quốc gia Cát Bà, vách đá biển.',                   N'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80', 1),
        (N'Mai Châu – Pù Luông 3N2Đ',    @CAdv, 2,  3,  3100000, 25, N'Trek ruộng bậc thang, bản Thái.',                       N'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80', 1),
        (N'Tà Năng – Phan Dũng 3N2Đ',    @CAdv, 1,  3,  4200000, 16, N'Cung trek nổi tiếng Tây Nguyên.',                       N'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80', 1),
        (N'Lang Biang Đà Lạt 2N1Đ',      @CAdv, 1,  2,  1950000, 28, N'Đỉnh Lang Biang, rừng thông.',                          N'https://picsum.photos/seed/dalat-lang-biang-pine/800/600', 1),
        (N'Bạch Mộc Lương Tử 3N2Đ',      @CAdv, 2,  3,  4800000, 14, N'Leo núi biên giới Việt–Trung (kỹ thuật).',               N'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', 1),
        (N'Sa Pa Bản Cát Cát 2N1Đ',       @CAdv, 2,  2,  2200000, 30, N'Bản làng, ruộng bậc thang.',                            N'https://picsum.photos/seed/sapa-cat-cat-village/800/600', 1),
        (N'Pù Luông Kẻm Chim 3N2Đ',      @CAdv, 2,  3,  2900000, 22, N'Kẻm Chim, suối, trekking nhẹ.',                         N'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80', 1),
        (N'Côn Đảo Trek & Biển 4N3Đ',     @CAdv, 21, 4,  7200000, 20, N'Rừng ông Đội, di tích lịch sử.',                         N'https://picsum.photos/seed/condao-trek-forest/800/600', 1),
        (N'Đèo Hải Vân – Lăng Cô 2N1Đ',   @CAdv, 6,  2,  2600000, 18, N'Cung đường ven biển đẹp nhất VN.',                     N'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80', 1);

    INSERT INTO Tours (TourName, CateId, DesId, DurationDays, Price, MaxCapacity, Description, ImageUrl, IsActive) VALUES
        (N'Maldives Resort 5N4Đ',        @CLux, 9,  5, 45000000, 12, N'Water villa, bữa tối hải sản.',                        N'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800&q=80', 1),
        (N'Dubai Marina & Desert 5N4Đ',   @CLux, 10, 5, 38000000, 14, N'Sa mạc safari, Burj Khalifa.',                         N'https://picsum.photos/seed/dubai-marina-burj/800/600', 1),
        (N'Santorini Sunset 6N5Đ',        @CLux, 11, 6, 52000000, 10, N'Caldera view, wine tour.',                             N'https://picsum.photos/seed/santorini-caldera-sunset/800/600', 1),
        (N'Nha Trang Vinpearl Luxury 4N3Đ', @CLux, 5, 4, 12000000, 20, N'Resort 5*, spa riêng.',                               N'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80', 1),
        (N'Phú Quốc Regent Style 4N3Đ',   @CLux, 4,  4, 15000000, 16, N'Biệt thự biển, butler.',                               N'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80', 1),
        (N'Đà Nẵng Golf & Resort 4N3Đ',   @CLux, 6,  4, 11000000, 12, N'Sân golf BRG, InterContinental.',                      N'https://picsum.photos/seed/danang-intercontinental-golf/800/600', 1),
        (N'Tokyo Premium 5N4Đ',           @CLux, 14, 5, 35000000, 15, N'Khách sạn 5*, Michelin dining.',                       N'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80', 1),
        (N'Seoul Suite 5N4Đ',            @CLux, 15, 5, 28000000, 16, N'Spa, K-beauty, suite view.',                            N'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80', 1),
        (N'Paris Champs-Élysées 7N6Đ',    @CLux, 16, 7, 62000000, 10, N'Louvre, cruise Seine.',                                 N'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80', 1),
        (N'Bali Ubud Villa 5N4Đ',         @CLux, 13, 5, 22000000, 14, N'Villa hồ bơi riêng, yoga.',                             N'https://picsum.photos/seed/bali-ubud-villa-pool/800/600', 1),
        (N'Phuket Yacht Charter 4N3Đ',    @CLux, 12, 4, 26000000, 8,  N'Du thuyền tư nhân, đảo Phi Phi.',                      N'https://images.unsplash.com/photo-1567894340315-735d7c361db0?w=800&q=80', 1),
        (N'Singapore Marina Bay 4N3Đ',    @CLux, 17, 4, 18000000, 18, N'Raffles, Gardens by the Bay.',                         N'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&q=80', 1);

    INSERT INTO Tours (TourName, CateId, DesId, DurationDays, Price, MaxCapacity, Description, ImageUrl, IsActive) VALUES
        (N'VinWonders Phú Quốc 3N2Đ',      @CFam, 4,  3,  8500000, 35, N'Công viên, thủy cung, phù hợp trẻ em.',               N'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80', 1),
        (N'Đà Lạt Thú Vui & Dâu 3N2Đ',   @CFam, 1,  3,  4500000, 36, N'Vườn dâu, đồi chè, xe Jeep.',                          N'https://picsum.photos/seed/dalat-strawberry-farm/800/600', 1),
        (N'Vinpearl Nha Trang 3N2Đ',      @CFam, 5,  3,  7800000, 38, N'Cáp treo, công viên nước.',                            N'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80', 1),
        (N'Hội An Lồng Đèn & Gốm 2N1Đ',   @CFam, 7,  2,  3200000, 32, N'Làm lồng đen, phố cổ về đêm.',                         N'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&q=80', 1),
        (N'Huế Di Sản 2N1Đ',              @CFam, 23, 2,  2900000, 34, N'Đại Nội, chùa Thiên Mụ.',                              N'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80', 1),
        (N'Mỹ Tho – Bến Tre 1N',          @CFam, 24, 1,  1200000, 40, N'Xuồng ba lá, kẹo dừa.',                                 N'https://picsum.photos/seed/mytho-mekong-coconut-candy/800/600', 1),
        (N'Sa Pa Cáp Treo Fansipan 2N1Đ', @CFam, 2,  2,  3800000, 35, N'Cáp treo, bản Cát Cát nhẹ.',                           N'https://picsum.photos/seed/fansipan-cable-car-sapa/800/600', 1),
        (N'Hạ Long Du Thuyền 2N1Đ',       @CFam, 3,  2,  5200000, 36, N'Du thuyền 4-5 sao, kayaking.',                         N'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=800&q=80', 1),
        (N'Tam Đảo Núi Mây 2N1Đ',         @CFam, 1,  2,  2100000, 33, N'Nhiệt đới nhẹ, quảng trường.',                         N'https://picsum.photos/seed/tam-dao-cloud-mountain/800/600', 1),
        (N'Bà Nà Hills 1N',              @CFam, 6,  1,  1850000, 40, N'Cầu Vàng, Fantasy Park.',                               N'https://picsum.photos/seed/ba-na-golden-bridge/800/600', 1),
        (N'Cần Thơ Chợ Nổi 2N1Đ',         @CFam, 24, 2,  2400000, 38, N'Cái Răng, vườn trái cây.',                             N'https://picsum.photos/seed/can-tho-floating-market/800/600', 1),
        (N'Quy Nhơn Biển Xanh 3N2Đ',     @CFam, 19, 3,  4100000, 34, N'Eo Gió, Kỳ Co, an toàn cho gia đình.',                  N'https://picsum.photos/seed/quy-nhon-eo-gio-family/800/600', 1);

    INSERT INTO Tours (TourName, CateId, DesId, DurationDays, Price, MaxCapacity, Description, ImageUrl, IsActive) VALUES
        (N'Nha Trang Biển Xanh 3N2Đ',     @CBeach, 5,  3,  4200000, 36, N'Resort biển, lặn snorkeling.',                        N'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80', 1),
        (N'Mũi Né Resort 3N2Đ',           @CBeach, 8,  3,  3900000, 34, N'Cồn cát, resort hồ bơi.',                              N'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80', 1),
        (N'Phú Quốc Sunset Beach 4N3Đ',   @CBeach, 4,  4,  6800000, 32, N'Bãi Sao, hoàng hôn.',                                 N'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80', 1),
        (N'Quy Nhơn Kỳ Co 3N2Đ',          @CBeach, 19, 3,  3600000, 35, N'Eo Gió, bãi Kỳ Co.',                                   N'https://picsum.photos/seed/quy-nhon-ky-co-beach/800/600', 1),
        (N'Lý Sơn Snorkeling 3N2Đ',       @CBeach, 20, 3,  3300000, 30, N'Đảo Bé, hang Câu.',                                    N'https://picsum.photos/seed/ly-son-garlic-island/800/600', 1),
        (N'Côn Đảo Biển Hoang Sơ 4N3Đ',   @CBeach, 21, 4,  8900000, 28, N'Bãi Đầm Trầu, lặn biển.',                              N'https://picsum.photos/seed/condao-dam-trau-beach/800/600', 1),
        (N'Phan Thiết Biển Dừa 2N1Đ',     @CBeach, 22, 2,  2500000, 38, N'Biển Đồi Dương, resort.',                              N'https://picsum.photos/seed/phan-thiet-doi-duong-beach/800/600', 1),
        (N'Đà Nẵng Mỹ Khê 3N2Đ',          @CBeach, 6,  3,  4700000, 36, N'Bãi Mỹ Khê, Non Nước.',                                N'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80', 1),
        (N'Hội An An Bàng 2N1Đ',          @CBeach, 7,  2,  2800000, 35, N'Biển An Bàng, phố cổ.',                               N'https://picsum.photos/seed/hoi-an-an-bang-beach/800/600', 1),
        (N'Hồ Tràm – Long Hải 2N1Đ',      @CBeach, 22, 2,  3100000, 33, N'Resort biển gần TP.HCM.',                              N'https://picsum.photos/seed/ho-tram-long-hai-beach/800/600', 1),
        (N'Cát Bà Biển & Kayak 3N2Đ',     @CBeach, 26, 3,  3500000, 32, N'Lan Hạ, kayak hang Luồn.',                             N'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=80', 1),
        (N'Phú Quốc Nam Du 3N2Đ',         @CBeach, 4,  3,  5200000, 26, N'Đảo nhỏ, nước trong.',                                 N'https://picsum.photos/seed/phu-quoc-nam-du-island/800/600', 1);

    DECLARE @D0 DATE = CAST(GETDATE() AS DATE);

    INSERT INTO TourSchedules (TourId, DepartureDate, ReturnDate, AvailableSlots, TotalSlots, EmployeeId, Status)
    SELECT T.TourId, DATEADD(DAY, 14, @D0),
        DATEADD(DAY, 14 + CASE WHEN T.DurationDays <= 1 THEN 1 ELSE T.DurationDays - 1 END, @D0),
        25, 25, @EmpId, N'Open'
    FROM Tours T;

    INSERT INTO TourSchedules (TourId, DepartureDate, ReturnDate, AvailableSlots, TotalSlots, EmployeeId, Status)
    SELECT T.TourId, DATEADD(DAY, 90, @D0),
        DATEADD(DAY, 90 + CASE WHEN T.DurationDays <= 1 THEN 1 ELSE T.DurationDays - 1 END, @D0),
        25, 25, @EmpId, N'Open'
    FROM Tours T;

    COMMIT TRAN;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRAN;
    THROW;
END CATCH;
GO

PRINT N'--- Kiểm tra seed ---';
SELECT C.CateName, COUNT(*) AS TourCount FROM Tours T JOIN Categories C ON T.CateId = C.CateId GROUP BY C.CateName;
SELECT COUNT(*) AS ToursMissingImage FROM Tours WHERE ImageUrl IS NULL OR LTRIM(RTRIM(ImageUrl)) = N'';
SELECT T.TourName, D.DesName FROM Tours T JOIN Destinations D ON T.DesId = D.DesId WHERE T.TourName LIKE N'%Hang Én%';
PRINT N'✅ seed_reset_catalog_and_tours.sql hoàn tất.';
GO
