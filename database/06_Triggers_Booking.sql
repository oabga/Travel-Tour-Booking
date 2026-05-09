-- ============================================================
--  06_Triggers_Booking.sql
--  TV2 — feature/booking: trg_AfterBookingInsert, trg_AfterBookingCancel
-- ============================================================

USE TravelBookingDB;
GO

-- ============================================================
-- trg_AfterBookingInsert
-- AFTER INSERT trên Bookings → trừ AvailableSlots
-- Nếu slot = 0, tự chuyển Schedule.Status thành 'Full'
-- ============================================================
IF OBJECT_ID('trg_AfterBookingInsert', 'TR') IS NOT NULL
    DROP TRIGGER trg_AfterBookingInsert;
GO

CREATE TRIGGER trg_AfterBookingInsert
ON Bookings
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    -- Trừ slot theo số người đặt
    UPDATE TS
    SET TS.AvailableSlots = TS.AvailableSlots - I.NumberOfPeople
    FROM TourSchedules TS
    JOIN inserted I ON TS.ScheduleId = I.ScheduleId;

    -- Nếu hết slot, đánh dấu 'Full'
    UPDATE TS
    SET TS.Status = N'Full'
    FROM TourSchedules TS
    JOIN inserted I ON TS.ScheduleId = I.ScheduleId
    WHERE TS.AvailableSlots = 0;
END;
GO

-- ============================================================
-- trg_AfterBookingCancel
-- AFTER UPDATE khi Status → 'Cancelled'
-- Cộng lại AvailableSlots, chuyển Schedule.Status về 'Open' nếu đang 'Full'
-- ============================================================
IF OBJECT_ID('trg_AfterBookingCancel', 'TR') IS NOT NULL
    DROP TRIGGER trg_AfterBookingCancel;
GO

CREATE TRIGGER trg_AfterBookingCancel
ON Bookings
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Chỉ xử lý khi cột Status thay đổi
    IF UPDATE(Status)
    BEGIN
        -- Cộng lại slot cho booking bị hủy
        -- (chỉ khi status cũ KHÔNG phải Cancelled → status mới là Cancelled)
        UPDATE TS
        SET TS.AvailableSlots = TS.AvailableSlots + I.NumberOfPeople
        FROM TourSchedules TS
        JOIN inserted I ON TS.ScheduleId = I.ScheduleId
        JOIN deleted D ON D.BookingId = I.BookingId
        WHERE I.Status = N'Cancelled'
          AND D.Status != N'Cancelled';

        -- Nếu Schedule đang 'Full' và giờ có slot trống, chuyển về 'Open'
        UPDATE TS
        SET TS.Status = N'Open'
        FROM TourSchedules TS
        JOIN inserted I ON TS.ScheduleId = I.ScheduleId
        WHERE I.Status = N'Cancelled'
          AND TS.AvailableSlots > 0
          AND TS.Status = N'Full';
    END
END;
GO

PRINT N'✅ trg_AfterBookingInsert và trg_AfterBookingCancel đã tạo thành công.';
GO
