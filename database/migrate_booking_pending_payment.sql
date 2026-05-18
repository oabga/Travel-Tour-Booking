-- Đặt tour → Pending, xác nhận sau khi thanh toán đủ
USE TravelBookingDB;
GO

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
