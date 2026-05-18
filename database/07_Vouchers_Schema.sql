-- ============================================================
--  07_Vouchers_Schema.sql
--  Khởi tạo bảng Vouchers động phục vụ quản lý mã giảm giá
-- ============================================================

USE TravelBookingDB;
GO

IF OBJECT_ID('Vouchers', 'U') IS NULL
BEGIN
    CREATE TABLE Vouchers (
        VoucherId INT IDENTITY(1,1) PRIMARY KEY,
        Code VARCHAR(50) UNIQUE NOT NULL,      -- Mã giảm giá (VD: BALO2026)
        DiscountPercent DECIMAL(5,2) NOT NULL, -- Phần trăm giảm (0 - 100)
        StartDate DATETIME NOT NULL,           -- Ngày bắt đầu có hiệu lực
        EndDate DATETIME NOT NULL,             -- Ngày hết hạn mã
        MaxUsage INT DEFAULT 100,              -- Số lần sử dụng tối đa
        UsedCount INT DEFAULT 0                -- Số lần đã sử dụng thực tế
    );

    -- Chèn dữ liệu mẫu
    INSERT INTO Vouchers (Code, DiscountPercent, StartDate, EndDate, MaxUsage, UsedCount)
    VALUES 
    ('HE2024', 10.00, '2024-01-01', '2026-12-31', 100, 0),
    ('DHM2024', 20.00, '2024-01-01', '2026-12-31', 200, 0),
    ('TRAVEL5', 5.00, '2024-01-01', '2026-12-31', 500, 0),
    ('SUMMER15', 15.00, '2024-01-01', '2026-12-31', 150, 0);
END
GO
