-- ============================================================
--  03_Views_Booking.sql
--  TV2 — feature/booking: vw_BookingDetails
-- ============================================================

USE TravelBookingDB;
GO

-- ============================================================
-- vw_BookingDetails
-- Chi tiết đơn hàng — JOIN Bookings + Accounts + CustomerProfiles
-- + TourSchedules + Tours + Destinations
-- ============================================================
IF OBJECT_ID('vw_BookingDetails', 'V') IS NOT NULL
    DROP VIEW vw_BookingDetails;
GO

CREATE VIEW vw_BookingDetails AS
SELECT
    B.BookingId,
    CP.FullName      AS UserName,
    CP.Phone         AS UserPhone,
    A.Email          AS UserEmail,
    T.TourName,
    D.DesName,
    S.DepartureDate,
    S.ReturnDate,
    B.NumberOfPeople,
    B.TotalAmount,
    B.DiscountPercent,
    B.Status         AS BookingStatus,
    B.BookingDate,
    B.Notes
FROM Bookings B
    JOIN Accounts A           ON B.AccountId   = A.AccountId
    LEFT JOIN CustomerProfiles CP ON A.AccountId   = CP.AccountId
    JOIN TourSchedules S      ON B.ScheduleId  = S.ScheduleId
    JOIN Tours T              ON S.TourId      = T.TourId
    JOIN Destinations D       ON T.DesId       = D.DesId;
GO

PRINT N'✅ vw_BookingDetails đã tạo thành công.';
GO
