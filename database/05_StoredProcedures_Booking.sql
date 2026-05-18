-- ============================================================
--  05_StoredProcedures_Booking.sql
--  TV2 — feature/booking: sp_CreateBooking, sp_CancelBooking
-- ============================================================

USE TravelBookingDB;
GO

-- ============================================================
-- sp_CreateBooking
-- Tạo booking trong TRANSACTION: kiểm tra slot (UPDLOCK)
-- → tính giá qua fn_CalcBookingTotal → INSERT Booking
-- → Trigger trg_AfterBookingInsert tự trừ slot
-- ============================================================
IF OBJECT_ID('sp_CreateBooking', 'P') IS NOT NULL
    DROP PROCEDURE sp_CreateBooking;
GO

CREATE PROCEDURE sp_CreateBooking
    @AccountId       INT,
    @ScheduleId      INT,
    @NumberOfPeople   INT,
    @DiscountPercent  DECIMAL(5,2)
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiểm tra lịch khởi hành tồn tại
    IF NOT EXISTS (SELECT 1 FROM TourSchedules WHERE ScheduleId = @ScheduleId)
        THROW 50001, N'Không tìm thấy lịch khởi hành', 1;

    -- Kiểm tra tài khoản tồn tại
    IF NOT EXISTS (SELECT 1 FROM Accounts WHERE AccountId = @AccountId)
        THROW 50002, N'Không tìm thấy khách hàng', 1;

    -- Kiểm tra lịch đang mở (Bug fix: tránh đặt tour vào lịch Full/Cancelled)
    IF NOT EXISTS (SELECT 1 FROM TourSchedules WHERE ScheduleId = @ScheduleId AND Status = N'Open')
        THROW 50008, N'Lịch khởi hành không còn mở đặt chỗ', 1;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Lấy AvailableSlots với UPDLOCK để tránh race condition
        DECLARE @Available INT;

        SELECT @Available = AvailableSlots
        FROM TourSchedules WITH (UPDLOCK, ROWLOCK)
        WHERE ScheduleId = @ScheduleId;

        -- Kiểm tra đủ chỗ
        IF @Available < @NumberOfPeople
            THROW 50003, N'Không đủ chỗ trống', 1;

        -- Tính tổng tiền qua function
        DECLARE @Total DECIMAL(12,2);
        SET @Total = dbo.fn_CalcBookingTotal(@ScheduleId, @NumberOfPeople, @DiscountPercent);

        IF @Total IS NULL
            THROW 50004, N'Không thể tính giá tour', 1;

        -- INSERT Booking — Trigger trg_AfterBookingInsert sẽ tự trừ slot
        -- Bug fix: lưu NewBookingId vào biến TRƯỚC khi COMMIT
        -- SCOPE_IDENTITY() trả về NULL nếu gọi sau COMMIT
        DECLARE @NewBookingId INT;

        INSERT INTO Bookings (AccountId, ScheduleId, NumberOfPeople, TotalAmount, DiscountPercent, Status)
        VALUES (@AccountId, @ScheduleId, @NumberOfPeople, @Total, @DiscountPercent, N'Pending');

        SET @NewBookingId = SCOPE_IDENTITY();

        COMMIT;

        -- Trả về BookingId vừa tạo
        SELECT @NewBookingId AS NewBookingId;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        THROW;
    END CATCH
END;
GO

-- ============================================================
-- sp_CancelBooking
-- Hủy booking: cập nhật Status → 'Cancelled'
-- Trigger trg_AfterBookingCancel sẽ hoàn lại slot
-- Không cho cancel lần 2 hoặc cancel booking đã Completed
-- ============================================================
IF OBJECT_ID('sp_CancelBooking', 'P') IS NOT NULL
    DROP PROCEDURE sp_CancelBooking;
GO

CREATE PROCEDURE sp_CancelBooking
    @BookingId INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiểm tra booking tồn tại và lấy status hiện tại
    DECLARE @CurrentStatus NVARCHAR(50);
    SELECT @CurrentStatus = Status FROM Bookings WHERE BookingId = @BookingId;

    IF @CurrentStatus IS NULL
        THROW 50005, N'Không tìm thấy booking', 1;

    IF @CurrentStatus = N'Cancelled'
        THROW 50006, N'Booking đã được hủy trước đó', 1;

    IF @CurrentStatus = N'Completed'
        THROW 50007, N'Không thể hủy booking đã hoàn thành', 1;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Cập nhật status → Trigger sẽ hoàn slot
        UPDATE Bookings
        SET Status = N'Cancelled'
        WHERE BookingId = @BookingId;

        COMMIT;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        THROW;
    END CATCH
END;
GO

PRINT N'✅ sp_CreateBooking và sp_CancelBooking đã tạo thành công.';
GO
