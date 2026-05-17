-- ============================================================
--  TravelBookingDB — Final SQL Script (IDENTICAL REFACTOR)
--  Users → Accounts + Roles + AccountRoles + CustomerProfiles
-- ============================================================

CREATE DATABASE TravelBookingDB;
GO

USE TravelBookingDB;
GO

-- ============================================================
-- SECTION 1: TABLES
-- ============================================================

CREATE TABLE Categories (
CateId      INT IDENTITY PRIMARY KEY,
CateName    NVARCHAR(100) NOT NULL,
Description NVARCHAR(255)
);

CREATE TABLE Destinations (
DesId       INT IDENTITY PRIMARY KEY,
DesName     NVARCHAR(150),
Country     NVARCHAR(100),
City        NVARCHAR(100),
Description NVARCHAR(255)
);

CREATE TABLE Tours (
TourId       INT IDENTITY PRIMARY KEY,
TourName     NVARCHAR(150),
CateId       INT,
DesId        INT,
DurationDays INT          CHECK (DurationDays > 0),
Price        DECIMAL(12,2) CHECK (Price > 0),
MaxCapacity  INT          CHECK (MaxCapacity > 0),
Description  NVARCHAR(255),
ImageUrl     NVARCHAR(255),
IsActive     BIT DEFAULT 1,

FOREIGN KEY (CateId) REFERENCES Categories(CateId),
FOREIGN KEY (DesId)  REFERENCES Destinations(DesId)

);

CREATE TABLE Employees (
EmployeeId INT IDENTITY PRIMARY KEY,
FullName   NVARCHAR(150),
Role       NVARCHAR(50),
Phone      NVARCHAR(20),
Email      NVARCHAR(150) UNIQUE
);

CREATE TABLE TourSchedules (
ScheduleId     INT IDENTITY PRIMARY KEY,
TourId         INT,
DepartureDate  DATE,
ReturnDate     DATE,
AvailableSlots INT CHECK (AvailableSlots >= 0),
EmployeeId     INT,
Status         NVARCHAR(50),
TotalSlots int NULL,
CONSTRAINT CK_ScheduleStatus
CHECK (Status IN (N'Open', N'Full', N'Cancelled')),

FOREIGN KEY (TourId)     REFERENCES Tours(TourId),
FOREIGN KEY (EmployeeId) REFERENCES Employees(EmployeeId),
CONSTRAINT CK_Date CHECK (ReturnDate > DepartureDate)

);

-- ================= NEW AUTH SYSTEM =================

CREATE TABLE Accounts (
AccountId INT IDENTITY PRIMARY KEY,
Email NVARCHAR(150) UNIQUE,
PasswordHash NVARCHAR(255) NOT NULL DEFAULT '',
CreatedAt DATETIME DEFAULT GETDATE()
);

CREATE TABLE Roles (
RoleId INT IDENTITY PRIMARY KEY,
RoleName NVARCHAR(50)
CONSTRAINT CK_RoleName
CHECK (RoleName IN (N'Admin', N'Staff', N'Customer'))
);

CREATE TABLE AccountRoles (
AccountId INT,
RoleId INT,
PRIMARY KEY (AccountId, RoleId),
FOREIGN KEY (AccountId) REFERENCES Accounts(AccountId),
FOREIGN KEY (RoleId) REFERENCES Roles(RoleId)
);

CREATE TABLE CustomerProfiles (
AccountId INT PRIMARY KEY,
FullName NVARCHAR(150),
Phone NVARCHAR(20),
DateOfBirth DATE,
Address NVARCHAR(255),
FOREIGN KEY (AccountId) REFERENCES Accounts(AccountId)
);

-- ================= BUSINESS =================

CREATE TABLE Bookings (
BookingId      INT IDENTITY PRIMARY KEY,
AccountId     INT,
ScheduleId     INT,
BookingDate    DATETIME DEFAULT GETDATE(),
NumberOfPeople INT CHECK (NumberOfPeople > 0),
TotalAmount    DECIMAL(12,2),
DiscountPercent DECIMAL(5,2) DEFAULT 0,
Status         NVARCHAR(50)
CONSTRAINT CK_BookingStatus
CHECK (Status IN (N'Pending', N'Confirmed', N'Completed', N'Cancelled')),
Notes          NVARCHAR(255),

FOREIGN KEY (AccountId) REFERENCES Accounts(AccountId),
FOREIGN KEY (ScheduleId) REFERENCES TourSchedules(ScheduleId)

);

CREATE TABLE BookingDetails (
DetailId         INT IDENTITY PRIMARY KEY,
BookingId        INT,
PassengerName    NVARCHAR(150),
PassengerDOB     DATE,
PassengerPhone   NVARCHAR(20),
IsPrimaryContact BIT DEFAULT 0,
PassengerType      NVARCHAR(20)  NOT NULL DEFAULT N'Adult'
    CONSTRAINT CK_PassengerType
        CHECK (PassengerType IN (N'Adult', N'Child')),
PassengerIdNumber  NVARCHAR(20)  NULL,  -- CCCD hoặc số hộ chiếu

FOREIGN KEY (BookingId) REFERENCES Bookings(BookingId)

);

CREATE TABLE Payments (
PaymentId       INT IDENTITY PRIMARY KEY,
BookingId       INT,
Amount          DECIMAL(12,2),
PaymentDate     DATETIME DEFAULT GETDATE(),
PaymentMethod   NVARCHAR(50)
CONSTRAINT CK_PaymentMethod
CHECK (PaymentMethod IN (N'VNPay', N'MoMo', N'BankTransfer', N'Cash')),
Status          NVARCHAR(50)
CONSTRAINT CK_PaymentStatus
CHECK (Status IN (N'Pending', N'Completed', N'Failed', N'Refunded')),
InvoiceCode     NVARCHAR(50),
TransactionCode NVARCHAR(100),

```
FOREIGN KEY (BookingId) REFERENCES Bookings(BookingId)
```

);

CREATE TABLE Reviews (
ReviewId   INT IDENTITY PRIMARY KEY,
AccountId INT,
TourId     INT,
Rating     INT CHECK (Rating BETWEEN 1 AND 5),
Comment    NVARCHAR(255),
ReviewDate DATETIME DEFAULT GETDATE(),

```
FOREIGN KEY (AccountId) REFERENCES Accounts(AccountId),
FOREIGN KEY (TourId)     REFERENCES Tours(TourId)
```

);
GO

-- ============================================================
-- SECTION 2: INDEXES
-- ============================================================

CREATE INDEX IX_Bookings_ScheduleId  ON Bookings(ScheduleId);
CREATE INDEX IX_Bookings_AccountId  ON Bookings(AccountId);
CREATE INDEX IX_Bookings_Status      ON Bookings(Status);
CREATE INDEX IX_TourSchedules_TourId ON TourSchedules(TourId);
CREATE INDEX IX_Reviews_TourId       ON Reviews(TourId);
GO

-- ============================================================
-- SECTION 3: FUNCTIONS
-- ============================================================

CREATE FUNCTION fn_CalcBookingTotal(
@ScheduleId INT,
@NumberOfPeople INT,
@DiscountPercent DECIMAL(5,2)
)
RETURNS DECIMAL(12,2)
AS
BEGIN
DECLARE @Price DECIMAL(12,2);
DECLARE @Result DECIMAL(12,2);

SELECT @Price = T.Price
FROM Tours T
JOIN TourSchedules S ON T.TourId = S.TourId
WHERE S.ScheduleId = @ScheduleId;

IF @Price IS NULL
    SET @Result = NULL;
ELSE
    SET @Result = @Price * @NumberOfPeople * (1 - @DiscountPercent / 100);

RETURN @Result;

END;
GO

CREATE FUNCTION fn_UserBookingCount(
@AccountId INT,
@Year INT
)
RETURNS INT
AS
BEGIN
DECLARE @Count INT;

SELECT @Count = COUNT(*)
FROM Bookings
WHERE AccountId = @AccountId
  AND YEAR(BookingDate) = @Year
  AND Status != N'Cancelled';

RETURN ISNULL(@Count, 0);

END;
GO

CREATE FUNCTION fn_GenerateInvoiceCode(@BookingId INT)
RETURNS NVARCHAR(50)
AS
BEGIN
DECLARE @Year NVARCHAR(4) = CAST(YEAR(GETDATE()) AS NVARCHAR(4));
DECLARE @Seq  NVARCHAR(4) = RIGHT('0000' + CAST(@BookingId AS NVARCHAR(10)), 4);
RETURN N'INV-' + @Year + N'-' + @Seq;
END;
GO

-- ============================================================
-- SECTION 4: STORED PROCEDURES
-- ============================================================

CREATE PROCEDURE sp_CreateBooking
@AccountId INT,
@ScheduleId INT,
@NumberOfPeople INT,
@DiscountPercent DECIMAL(5,2)
AS
BEGIN
SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM TourSchedules WHERE ScheduleId = @ScheduleId)
        THROW 50001, N'Không tìm thấy lịch khởi hành', 1;

    IF NOT EXISTS (SELECT 1 FROM Accounts WHERE AccountId = @AccountId)
        THROW 50002, N'Không tìm thấy khách hàng', 1;

    -- Kiểm tra lịch đang mở
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

        -- Bug fix: lưu NewBookingId TRƯỚC khi COMMIT
        DECLARE @NewBookingId INT;

        INSERT INTO Bookings (AccountId, ScheduleId, NumberOfPeople, TotalAmount, DiscountPercent, Status)
        VALUES (@AccountId, @ScheduleId, @NumberOfPeople, @Total, @DiscountPercent, N'Confirmed');

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

CREATE PROCEDURE sp_CancelBooking
@BookingId INT
AS
BEGIN
SET NOCOUNT ON;

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

CREATE PROCEDURE sp_SearchTours
@Destination NVARCHAR(100) = NULL,
@PriceMin DECIMAL(12,2) = NULL,
@PriceMax DECIMAL(12,2) = NULL,
@Date DATE = NULL
AS
BEGIN
SET NOCOUNT ON;

SELECT
    T.TourId, T.TourName, T.Price, T.DurationDays,
    T.MaxCapacity, T.Description, T.ImageUrl,
    D.DesName, D.Country,
    S.ScheduleId, S.DepartureDate, S.ReturnDate,
    S.AvailableSlots, S.Status AS ScheduleStatus
FROM Tours T
JOIN Destinations D ON T.DesId = D.DesId
JOIN TourSchedules S ON T.TourId = S.TourId
WHERE T.IsActive = 1
  AND S.AvailableSlots > 0
  AND S.Status = N'Open'
  AND (@Destination IS NULL OR D.DesName LIKE N'%' + @Destination + N'%')
  AND (@PriceMin IS NULL OR T.Price >= @PriceMin)
  AND (@PriceMax IS NULL OR T.Price <= @PriceMax)
  AND (@Date IS NULL OR S.DepartureDate >= @Date)
ORDER BY S.DepartureDate;

END;
GO

CREATE PROCEDURE sp_RevenueReport
@FromDate DATE = NULL,
@ToDate DATE = NULL
AS
BEGIN
SET NOCOUNT ON;

SELECT
    YEAR(B.BookingDate) AS RevenueYear,
    MONTH(B.BookingDate) AS RevenueMonth,
    COUNT(B.BookingId) AS TotalBookings,
    SUM(B.TotalAmount) AS TotalRevenue,
    AVG(B.TotalAmount) AS AvgOrderValue
FROM Bookings B
WHERE B.Status IN (N'Confirmed', N'Completed')
  AND (@FromDate IS NULL OR CAST(B.BookingDate AS DATE) >= @FromDate)
  AND (@ToDate IS NULL OR CAST(B.BookingDate AS DATE) <= @ToDate)
GROUP BY YEAR(B.BookingDate), MONTH(B.BookingDate)
ORDER BY RevenueYear, RevenueMonth;

END;
GO

-- ============================================================
-- SECTION 5: VIEWS
-- ============================================================

CREATE VIEW vw_TourRevenue AS
SELECT
T.TourId,
T.TourName,
D.DesName,
COUNT(B.BookingId) AS TotalBookings,
SUM(B.TotalAmount) AS TotalRevenue
FROM Tours T
JOIN Destinations D ON T.DesId = D.DesId
LEFT JOIN TourSchedules S ON T.TourId = S.TourId
LEFT JOIN Bookings B ON S.ScheduleId = B.ScheduleId
AND B.Status IN (N'Confirmed', N'Completed')
GROUP BY T.TourId, T.TourName, D.DesName;
GO

CREATE VIEW vw_BookingDetails AS
SELECT
B.BookingId,
CP.FullName AS UserName,
CP.Phone AS UserPhone,
A.Email AS UserEmail,
T.TourName,
D.DesName,
S.DepartureDate,
S.ReturnDate,
B.NumberOfPeople,
B.TotalAmount,
B.DiscountPercent,
B.Status AS BookingStatus,
B.BookingDate,
B.Notes
FROM Bookings B
JOIN Accounts A ON B.AccountId = A.AccountId
LEFT JOIN CustomerProfiles CP ON A.AccountId = CP.AccountId
JOIN TourSchedules S ON B.ScheduleId = S.ScheduleId
JOIN Tours T ON S.TourId = T.TourId
JOIN Destinations D ON T.DesId = D.DesId;
GO

CREATE VIEW vw_PopularTours AS
SELECT
T.TourId,
T.TourName,
T.Price,
T.DurationDays,
C.CateName,
D.DesName,
AVG(CAST(R.Rating AS DECIMAL(3,1))) AS AvgRating,
COUNT(DISTINCT R.ReviewId) AS TotalReviews,
COUNT(DISTINCT B.BookingId) AS TotalBookings
FROM Tours T
LEFT JOIN Reviews R ON T.TourId = R.TourId
LEFT JOIN Categories C ON T.CateId = C.CateId
LEFT JOIN Destinations D ON T.DesId = D.DesId
LEFT JOIN TourSchedules S ON T.TourId = S.TourId
LEFT JOIN Bookings B ON S.ScheduleId = B.ScheduleId
AND B.Status IN (N'Confirmed', N'Completed')
GROUP BY T.TourId, T.TourName, T.Price, T.DurationDays, C.CateName, D.DesName;
GO

-- ============================================================
-- SECTION 6: TRIGGERS
-- ============================================================

CREATE TRIGGER trg_AfterBookingInsert
ON Bookings
AFTER INSERT
AS
BEGIN
SET NOCOUNT ON;

    -- Chỉ trừ slot với booking không bị Cancelled
    UPDATE TS
    SET TS.AvailableSlots = TS.AvailableSlots - I.NumberOfPeople
    FROM TourSchedules TS
    JOIN inserted I ON TS.ScheduleId = I.ScheduleId
    WHERE I.Status != N'Cancelled';

    UPDATE TS
    SET TS.Status = N'Full'
    FROM TourSchedules TS
    JOIN inserted I ON TS.ScheduleId = I.ScheduleId
    WHERE TS.AvailableSlots = 0
      AND I.Status != N'Cancelled';

END;
GO

CREATE TRIGGER trg_AfterBookingCancel
ON Bookings
AFTER UPDATE
AS
BEGIN
SET NOCOUNT ON;

    IF UPDATE(Status)
    BEGIN
        UPDATE TS
        SET TS.AvailableSlots = TS.AvailableSlots + I.NumberOfPeople
        FROM TourSchedules TS
        JOIN inserted I ON TS.ScheduleId = I.ScheduleId
        JOIN deleted D ON D.BookingId = I.BookingId
        WHERE I.Status = N'Cancelled'
          AND D.Status != N'Cancelled';

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


-- ============================================================
-- SECTION 7: SEED DATA
-- ============================================================

INSERT INTO Roles VALUES (N'Admin'), (N'Staff'), (N'Customer');

INSERT INTO Accounts (Email) VALUES
('an@gmail.com'),
('binh@gmail.com'),
('cuong@gmail.com'),
('admin@travel.com'),
('staff@travel.com');

INSERT INTO AccountRoles VALUES
(1,3),(2,3),(3,3),(4,1),(5,2);

INSERT INTO CustomerProfiles VALUES
(1,N'Nguyễn Văn An','0911111111','1995-01-15',N'TP.HCM'),
(2,N'Trần Thị Bình','0912222222','1998-05-20',N'Hà Nội'),
(3,N'Lê Hoàng Cường','0913333333','1990-09-10',N'Đà Nẵng');

INSERT INTO Categories (CateName, Description) VALUES
(N'Tour Miền Tây',   N'Tour khám phá miền Tây'),
(N'Tour Phan Thiết', N'Tour biển Phan Thiết'),
(N'Đà Nẵng',         N'Tour Đà Nẵng'),
(N'Phú Quốc',        N'Tour đảo Phú Quốc'),
(N'Miền Bắc',        N'Tour miền Bắc'),
(N'Đà Lạt',          N'Tour Đà Lạt'),
(N'Hồ Chí Minh',    N'Tour TP.HCM'),
(N'Tour Đảo',        N'Tour đảo'),
(N'Nha Trang',       N'Tour Nha Trang');

INSERT INTO Destinations (DesName, Country, City, Description) VALUES
(N'Đà Lạt',      N'Việt Nam', N'Lâm Đồng',   N'Thành phố sương mù'),
(N'Phú Quốc',    N'Việt Nam', N'Kiên Giang', N'Đảo ngọc'),
(N'Nha Trang',   N'Việt Nam', N'Khánh Hòa',  N'Thành phố biển'),
(N'Đà Nẵng',     N'Việt Nam', N'Đà Nẵng',    N'Thành phố biển'),
(N'Phan Thiết',  N'Việt Nam', N'Bình Thuận', N'Biển Phan Thiết'),
(N'Miền Tây',    N'Việt Nam', N'Cần Thơ',    N'Đồng bằng sông Cửu Long'),
(N'Hồ Chí Minh', N'Việt Nam', N'TP.HCM',     N'Thành phố lớn nhất'),
(N'Miền Bắc',    N'Việt Nam', N'Hà Nội',     N'Miền Bắc'),
(N'Bangkok',      N'Thái Lan', N'Bangkok',    N'Thủ đô Thái Lan');

INSERT INTO Employees (FullName, Role, Phone, Email) VALUES
(N'Nguyễn Văn A', N'Guide',    '0901234567', 'guide_a@travel.com'),
(N'Trần Thị B',   N'Guide',    '0902345678', 'guide_b@travel.com'),
(N'Lê Văn C',     N'Manager',  '0903333333', 'manager@travel.com');

-- CateId: 6=Đà Lạt, 4=Phú Quốc, 9=Nha Trang, 5=Miền Bắc
INSERT INTO Tours (TourName, CateId, DesId, DurationDays, Price, MaxCapacity, Description, ImageUrl, IsActive) VALUES
(N'Tour Đà Lạt 3N2Đ',    6, 1, 3, 2500000, 20, N'Khám phá thành phố sương mù', NULL, 1),
(N'Tour Phú Quốc 4N3Đ',  4, 2, 4, 5000000, 25, N'Nghỉ dưỡng đảo ngọc',         NULL, 1),
(N'Tour Nha Trang 2N1Đ', 9, 3, 2, 1800000, 15, N'Biển xanh cát trắng',          NULL, 1),
(N'Tour Bangkok 5N4Đ',    5, 9, 5, 7500000, 20, N'Khám phá xứ chùa vàng',        NULL, 1);

INSERT INTO TourSchedules (TourId, DepartureDate, ReturnDate, AvailableSlots, EmployeeId, Status) VALUES
(1, '2026-06-01', '2026-06-03', 5,  1, N'Open'),
(2, '2026-06-15', '2026-06-18', 3,  2, N'Open'),
(3, '2026-07-01', '2026-07-02', 10, 3, N'Open'),
(4, '2026-07-20', '2026-07-24', 8,  1, N'Open'),
(1, '2026-08-01', '2026-08-03', 20, 2, N'Open');


-- Test sp_CreateBooking — Trigger sẽ tự trừ slot
EXEC sp_CreateBooking 1, 1, 2, 10;   -- An đặt 2 người, giảm 10% → slot còn 3
EXEC sp_CreateBooking 2, 2, 1, 0;    -- Bình đặt 1 người → slot còn 2
EXEC sp_CreateBooking 3, 3, 3, 5;    -- Cường đặt 3 người, giảm 5%

INSERT INTO BookingDetails (BookingId, PassengerName, PassengerDOB, PassengerPhone, IsPrimaryContact, PassengerType, PassengerIdNumber) VALUES
(1, N'Nguyễn Văn An',   '1995-01-15', '0911111111', 1, N'Adult', N'079095001234'),
(1, N'Nguyễn Thị Mai',  '1997-03-20', '0911111112', 0, N'Adult', N'079097005678'),
(2, N'Trần Thị Bình',   '1998-05-20', '0912222222', 1, N'Adult', N'001098002345'),
(3, N'Lê Hoàng Cường',  '1990-09-10', '0913333333', 1, N'Adult', N'048090003456'),
(3, N'Lê Thị Dung',     '2015-06-01', '0913333334', 0, N'Child', NULL),
(3, N'Lê Văn Em',       '2018-12-01', '0913333335', 0, N'Child', NULL);

INSERT INTO Payments (BookingId, Amount, PaymentDate, PaymentMethod, Status, InvoiceCode, TransactionCode) VALUES
(1, 4500000, GETDATE(), N'VNPay',       N'Completed', dbo.fn_GenerateInvoiceCode(1), N'VNP20260601001'),
(2, 5000000, GETDATE(), N'BankTransfer',N'Completed', dbo.fn_GenerateInvoiceCode(2), NULL),
(3, 5130000, GETDATE(), N'MoMo',        N'Completed', dbo.fn_GenerateInvoiceCode(3), N'MOMO20260601003');

INSERT INTO Reviews (AccountId, TourId, Rating, Comment) VALUES
(1, 1, 5, N'Tour tuyệt vời, hướng dẫn viên nhiệt tình!'),
(2, 2, 4, N'Phòng đẹp, đồ ăn ngon. Sẽ quay lại.'),
(3, 3, 5, N'Biển rất đẹp, giá hợp lý.');

-- ============================================================
-- SECTION 8: TEST SCRIPTS
-- ============================================================

PRINT '=== TEST 1: Đặt tour hợp lệ ===';
EXEC sp_CreateBooking 1, 4, 2, 0;

PRINT '=== TEST 2: Không đủ slot ===';
EXEC sp_CreateBooking 1, 1, 10, 0;

PRINT '=== TEST 3: Lịch không tồn tại ===';
EXEC sp_CreateBooking 1, 999, 1, 0;

PRINT '=== TEST 4: Hủy booking ===';
EXEC sp_CancelBooking 1;
SELECT ScheduleId, AvailableSlots, Status FROM TourSchedules WHERE ScheduleId = 1;

PRINT '=== TEST 5: Hủy lần 2 (phải báo lỗi) ===';
EXEC sp_CancelBooking 1;

PRINT '=== TEST 6: Tìm tour không giới hạn ===';
EXEC sp_SearchTours NULL, NULL, NULL, NULL;

PRINT '=== TEST 7: Tìm tour theo điểm đến ===';
EXEC sp_SearchTours N'Đà Lạt', NULL, NULL, NULL;

PRINT '=== TEST 8: Tìm tour theo khoảng giá ===';
EXEC sp_SearchTours NULL, 1000000, 3000000, NULL;

PRINT '=== TEST 9: Kiểm tra Views ===';
SELECT * FROM vw_TourRevenue;
SELECT * FROM vw_BookingDetails;
SELECT * FROM vw_PopularTours;

PRINT '=== TEST 10: Báo cáo doanh thu ===';
EXEC sp_RevenueReport NULL, NULL;
EXEC sp_RevenueReport '2026-01-01', '2026-12-31';

PRINT '=== TEST 11: Kiểm tra Functions ===';
SELECT dbo.fn_CalcBookingTotal(1, 2, 10)        AS TotalAfterDiscount;
SELECT dbo.fn_UserBookingCount(1, 2026)     AS BookingCount;
SELECT dbo.fn_GenerateInvoiceCode(99)           AS InvoiceCode;

PRINT '=== TEST 12: Trigger - đặt liên tiếp đến hết slot ===';
EXEC sp_CreateBooking 1, 1, 1, 0;
EXEC sp_CreateBooking 2, 1, 1, 0;
EXEC sp_CreateBooking 3, 1, 1, 0;
-- Lần này phải báo không đủ chỗ
EXEC sp_CreateBooking 1, 1, 1, 0;
SELECT ScheduleId, AvailableSlots, Status FROM TourSchedules WHERE ScheduleId = 1;
