-- ============================================================
--  02_schema_extensions.sql
--  Bổ sung schema sau TravelBookingDB.sql (idempotent — chạy lại an toàn)
--  - Bảng Vouchers + mã mẫu
--  - sp_CreateBooking → trạng thái Pending (chờ thanh toán)
--  - Cột phiên thanh toán 2 phút trên Bookings
-- ============================================================

USE TravelBookingDB;
GO

-- --- Vouchers ---
IF OBJECT_ID('Vouchers', 'U') IS NULL
BEGIN
    CREATE TABLE Vouchers (
        VoucherId INT IDENTITY(1,1) PRIMARY KEY,
        Code VARCHAR(50) UNIQUE NOT NULL,
        DiscountPercent DECIMAL(5,2) NOT NULL,
        StartDate DATETIME NOT NULL,
        EndDate DATETIME NOT NULL,
        MaxUsage INT DEFAULT 100,
        UsedCount INT DEFAULT 0
    );

    INSERT INTO Vouchers (Code, DiscountPercent, StartDate, EndDate, MaxUsage, UsedCount)
    VALUES
        ('HE2024', 10.00, '2024-01-01', '2026-12-31', 100, 0),
        ('DHM2024', 20.00, '2024-01-01', '2026-12-31', 200, 0),
        ('TRAVEL5', 5.00, '2024-01-01', '2026-12-31', 500, 0),
        ('SUMMER15', 15.00, '2024-01-01', '2026-12-31', 150, 0);
END
GO

-- --- Booking Pending + payment session columns ---
IF COL_LENGTH('Bookings', 'PaymentSessionStartedAt') IS NULL
    ALTER TABLE Bookings ADD PaymentSessionStartedAt DATETIME NULL;
GO

IF COL_LENGTH('Bookings', 'PaymentDeadlineAt') IS NULL
    ALTER TABLE Bookings ADD PaymentDeadlineAt DATETIME NULL;
GO

IF OBJECT_ID('sp_CreateBooking', 'P') IS NOT NULL
    DROP PROCEDURE sp_CreateBooking;
GO

CREATE PROCEDURE sp_CreateBooking
    @AccountId       INT,
    @ScheduleId      INT,
    @NumberOfPeople  INT,
    @DiscountPercent DECIMAL(5,2)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM TourSchedules WHERE ScheduleId = @ScheduleId)
        THROW 50001, N'Không tìm thấy lịch khởi hành', 1;

    IF NOT EXISTS (SELECT 1 FROM Accounts WHERE AccountId = @AccountId)
        THROW 50002, N'Không tìm thấy khách hàng', 1;

    IF NOT EXISTS (SELECT 1 FROM TourSchedules WHERE ScheduleId = @ScheduleId AND Status = N'Open')
        THROW 50008, N'Lịch khởi hành không còn mở đặt chỗ', 1;

    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @Available INT;
        SELECT @Available = AvailableSlots
        FROM TourSchedules WITH (UPDLOCK, ROWLOCK)
        WHERE ScheduleId = @ScheduleId;

        IF @Available < @NumberOfPeople
            THROW 50003, N'Không đủ chỗ trống', 1;

        DECLARE @Total DECIMAL(12,2);
        SET @Total = dbo.fn_CalcBookingTotal(@ScheduleId, @NumberOfPeople, @DiscountPercent);

        IF @Total IS NULL
            THROW 50004, N'Không thể tính giá tour', 1;

        DECLARE @NewBookingId INT;

        INSERT INTO Bookings (AccountId, ScheduleId, NumberOfPeople, TotalAmount, DiscountPercent, Status)
        VALUES (@AccountId, @ScheduleId, @NumberOfPeople, @Total, @DiscountPercent, N'Pending');

        SET @NewBookingId = SCOPE_IDENTITY();
        COMMIT;
        SELECT @NewBookingId AS NewBookingId;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        THROW;
    END CATCH
END;
GO

PRINT N'✅ 02_schema_extensions.sql hoàn tất.';
GO
