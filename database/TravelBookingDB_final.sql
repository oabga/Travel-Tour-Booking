-- ============================================================
--  TravelBookingDB — Final SQL Script
--  Bao gồm: Tables, Functions, Stored Procedures, Views,
--            Triggers, Seed Data, Test Scripts
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
    Status         NVARCHAR(50)
        CONSTRAINT CK_ScheduleStatus
            CHECK (Status IN (N'Open', N'Full', N'Cancelled')),

    FOREIGN KEY (TourId)     REFERENCES Tours(TourId),
    FOREIGN KEY (EmployeeId) REFERENCES Employees(EmployeeId),
    CONSTRAINT CK_Date CHECK (ReturnDate > DepartureDate)
);

-- [FIX] Thêm PasswordHash và Role cho JWT Authentication
CREATE TABLE Customers (
    CustomerId   INT IDENTITY PRIMARY KEY,
    FullName     NVARCHAR(150),
    Email        NVARCHAR(150) UNIQUE,
    Phone        NVARCHAR(20),
    DateOfBirth  DATE,
    Address      NVARCHAR(255),
    PasswordHash NVARCHAR(255) NOT NULL DEFAULT '',
    Role         NVARCHAR(50)  NOT NULL DEFAULT N'Customer'
        CONSTRAINT CK_CustomerRole
            CHECK (Role IN (N'Admin', N'Staff', N'Customer')),
    CreatedAt    DATETIME DEFAULT GETDATE()
);

CREATE TABLE Bookings (
    BookingId      INT IDENTITY PRIMARY KEY,
    CustomerId     INT,
    ScheduleId     INT,
    BookingDate    DATETIME DEFAULT GETDATE(),
    NumberOfPeople INT CHECK (NumberOfPeople > 0),
    TotalAmount    DECIMAL(12,2),
    DiscountPercent DECIMAL(5,2) DEFAULT 0,
    Status         NVARCHAR(50)
        -- [FIX] Thêm CHECK constraint cho trạng thái Booking
        CONSTRAINT CK_BookingStatus
            CHECK (Status IN (N'Pending', N'Confirmed', N'Completed', N'Cancelled')),
    Notes          NVARCHAR(255),

    FOREIGN KEY (CustomerId) REFERENCES Customers(CustomerId),
    FOREIGN KEY (ScheduleId) REFERENCES TourSchedules(ScheduleId)
);

-- [FIX] Thêm PassengerType để phân loại Người lớn / Trẻ em
CREATE TABLE BookingDetails (
    DetailId         INT IDENTITY PRIMARY KEY,
    BookingId        INT,
    PassengerName    NVARCHAR(150),
    PassengerDOB     DATE,
    PassengerPhone   NVARCHAR(20),
    IsPrimaryContact BIT DEFAULT 0,
    PassengerType    NVARCHAR(20) NOT NULL DEFAULT N'Adult'
        CONSTRAINT CK_PassengerType
            CHECK (PassengerType IN (N'Adult', N'Child')),

    FOREIGN KEY (BookingId) REFERENCES Bookings(BookingId)
);

-- [FIX] Thêm InvoiceCode và TransactionCode cho Payments
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

    FOREIGN KEY (BookingId) REFERENCES Bookings(BookingId)
);

CREATE TABLE Reviews (
    ReviewId   INT IDENTITY PRIMARY KEY,
    CustomerId INT,
    TourId     INT,
    Rating     INT CHECK (Rating BETWEEN 1 AND 5),
    Comment    NVARCHAR(255),
    ReviewDate DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (CustomerId) REFERENCES Customers(CustomerId),
    FOREIGN KEY (TourId)     REFERENCES Tours(TourId)
);
GO

-- ============================================================
-- SECTION 2: INDEXES (tối ưu performance cho JOIN/filter)
-- ============================================================

CREATE INDEX IX_Bookings_ScheduleId  ON Bookings(ScheduleId);
CREATE INDEX IX_Bookings_CustomerId  ON Bookings(CustomerId);
CREATE INDEX IX_Bookings_Status      ON Bookings(Status);
CREATE INDEX IX_TourSchedules_TourId ON TourSchedules(TourId);
CREATE INDEX IX_Reviews_TourId       ON Reviews(TourId);
GO

-- ============================================================
-- SECTION 3: FUNCTIONS
-- ============================================================

-- Function 1: Tính tổng tiền booking sau giảm giá
CREATE FUNCTION fn_CalcBookingTotal(
    @ScheduleId     INT,
    @NumberOfPeople INT,
    @DiscountPercent DECIMAL(5,2)
)
RETURNS DECIMAL(12,2)
AS
BEGIN
    DECLARE @Price  DECIMAL(12,2);
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

-- Function 2: Đếm số booking của khách hàng trong một năm
CREATE FUNCTION fn_CustomerBookingCount(
    @CustomerId INT,
    @Year       INT
)
RETURNS INT
AS
BEGIN
    DECLARE @Count INT;

    SELECT @Count = COUNT(*)
    FROM Bookings
    WHERE CustomerId = @CustomerId
      AND YEAR(BookingDate) = @Year
      AND Status != N'Cancelled';

    RETURN ISNULL(@Count, 0);
END;
GO

-- [NEW] Function 3: Sinh mã hóa đơn dạng INV-2026-0001
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

-- SP 1: Tạo booking (có Transaction + TRY-CATCH)
-- [FIX] Bỏ UPDATE slot trong SP — để Trigger xử lý hoàn toàn
-- [FIX] Đổi RAISERROR sang THROW (chuẩn SQL Server hiện đại)
-- [FIX] Cấu trúc TRY-CATCH đúng vị trí
CREATE PROCEDURE sp_CreateBooking
    @CustomerId     INT,
    @ScheduleId     INT,
    @NumberOfPeople INT,
    @DiscountPercent DECIMAL(5,2)
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiểm tra trước khi mở transaction
    IF NOT EXISTS (SELECT 1 FROM TourSchedules WHERE ScheduleId = @ScheduleId)
    BEGIN
        THROW 50001, N'Không tìm thấy lịch khởi hành', 1;
        RETURN;
    END

    IF NOT EXISTS (SELECT 1 FROM Customers WHERE CustomerId = @CustomerId)
    BEGIN
        THROW 50002, N'Không tìm thấy khách hàng', 1;
        RETURN;
    END

    BEGIN TRY
        BEGIN TRANSACTION;

            DECLARE @Available INT;

            -- UPDLOCK + ROWLOCK: tránh race condition khi nhiều người đặt cùng lúc
            SELECT @Available = AvailableSlots
            FROM TourSchedules WITH (UPDLOCK, ROWLOCK)
            WHERE ScheduleId = @ScheduleId;

            IF @Available < @NumberOfPeople
                THROW 50003, N'Không đủ chỗ trống', 1;

            DECLARE @Total DECIMAL(12,2);
            SET @Total = dbo.fn_CalcBookingTotal(@ScheduleId, @NumberOfPeople, @DiscountPercent);

            IF @Total IS NULL
                THROW 50004, N'Không thể tính giá tour', 1;

            -- INSERT Booking — Trigger trg_AfterBookingInsert sẽ tự trừ slot
            INSERT INTO Bookings (CustomerId, ScheduleId, NumberOfPeople, TotalAmount, DiscountPercent, Status)
            VALUES (@CustomerId, @ScheduleId, @NumberOfPeople, @Total, @DiscountPercent, N'Confirmed');

        COMMIT;

        -- Trả về BookingId vừa tạo
        SELECT SCOPE_IDENTITY() AS NewBookingId;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        THROW;
    END CATCH
END;
GO

-- SP 2: Hủy booking
-- [FIX] Kiểm tra điều kiện TRƯỚC khi mở TRANSACTION
-- [FIX] sp_CancelBooking KHÔNG cần UPDATE slot — Trigger xử lý
CREATE PROCEDURE sp_CancelBooking
    @BookingId INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiểm tra tồn tại và trạng thái TRƯỚC khi mở transaction
    DECLARE @CurrentStatus NVARCHAR(50);
    SELECT @CurrentStatus = Status FROM Bookings WHERE BookingId = @BookingId;

    IF @CurrentStatus IS NULL
    BEGIN
        THROW 50005, N'Không tìm thấy booking', 1;
        RETURN;
    END

    IF @CurrentStatus = N'Cancelled'
    BEGIN
        THROW 50006, N'Booking đã được hủy trước đó', 1;
        RETURN;
    END

    IF @CurrentStatus = N'Completed'
    BEGIN
        THROW 50007, N'Không thể hủy booking đã hoàn thành', 1;
        RETURN;
    END

    BEGIN TRY
        BEGIN TRANSACTION;

            -- Chỉ UPDATE Status — Trigger trg_AfterBookingCancel tự hoàn slot
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

-- SP 3: Tìm kiếm tour nâng cao
-- [FIX] Tất cả tham số là OPTIONAL (NULL = bỏ qua filter đó)
CREATE PROCEDURE sp_SearchTours
    @Destination NVARCHAR(100) = NULL,
    @PriceMin    DECIMAL(12,2) = NULL,
    @PriceMax    DECIMAL(12,2) = NULL,
    @Date        DATE          = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        T.TourId,
        T.TourName,
        T.Price,
        T.DurationDays,
        T.MaxCapacity,
        T.Description,
        T.ImageUrl,
        D.DesName,
        D.Country,
        S.ScheduleId,
        S.DepartureDate,
        S.ReturnDate,
        S.AvailableSlots,
        S.Status AS ScheduleStatus
    FROM Tours T
    JOIN Destinations D   ON T.DesId = D.DesId
    JOIN TourSchedules S  ON T.TourId = S.TourId
    WHERE T.IsActive = 1
      AND S.AvailableSlots > 0
      AND S.Status = N'Open'
      AND (@Destination IS NULL OR D.DesName LIKE N'%' + @Destination + N'%')
      AND (@PriceMin    IS NULL OR T.Price >= @PriceMin)
      AND (@PriceMax    IS NULL OR T.Price <= @PriceMax)
      AND (@Date        IS NULL OR S.DepartureDate >= @Date)
    ORDER BY S.DepartureDate;
END;
GO

-- [NEW] SP 4: Báo cáo doanh thu theo tháng
CREATE PROCEDURE sp_RevenueReport
    @FromDate DATE = NULL,
    @ToDate   DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        YEAR(B.BookingDate)  AS RevenueYear,
        MONTH(B.BookingDate) AS RevenueMonth,
        COUNT(B.BookingId)   AS TotalBookings,
        SUM(B.TotalAmount)   AS TotalRevenue,
        AVG(B.TotalAmount)   AS AvgOrderValue
    FROM Bookings B
    WHERE B.Status IN (N'Confirmed', N'Completed')
      AND (@FromDate IS NULL OR CAST(B.BookingDate AS DATE) >= @FromDate)
      AND (@ToDate   IS NULL OR CAST(B.BookingDate AS DATE) <= @ToDate)
    GROUP BY YEAR(B.BookingDate), MONTH(B.BookingDate)
    ORDER BY RevenueYear, RevenueMonth;
END;
GO

-- ============================================================
-- SECTION 5: VIEWS
-- ============================================================

-- View 1: Doanh thu theo tour
CREATE VIEW vw_TourRevenue AS
SELECT
    T.TourId,
    T.TourName,
    D.DesName,
    COUNT(B.BookingId)  AS TotalBookings,
    SUM(B.TotalAmount)  AS TotalRevenue
FROM Tours T
JOIN Destinations D    ON T.DesId = D.DesId
LEFT JOIN TourSchedules S  ON T.TourId = S.TourId
LEFT JOIN Bookings B       ON S.ScheduleId = B.ScheduleId
                          AND B.Status IN (N'Confirmed', N'Completed')
GROUP BY T.TourId, T.TourName, D.DesName;
GO

-- View 2: Chi tiết booking (JOIN 4 bảng)
CREATE VIEW vw_BookingDetails AS
SELECT
    B.BookingId,
    C.FullName      AS CustomerName,
    C.Phone         AS CustomerPhone,
    C.Email         AS CustomerEmail,
    T.TourName,
    D.DesName,
    S.DepartureDate,
    S.ReturnDate,
    B.NumberOfPeople,
    B.TotalAmount,
    B.DiscountPercent,
    B.Status        AS BookingStatus,
    B.BookingDate,
    B.Notes
FROM Bookings B
JOIN Customers    C ON B.CustomerId = C.CustomerId
JOIN TourSchedules S ON B.ScheduleId = S.ScheduleId
JOIN Tours        T ON S.TourId = T.TourId
JOIN Destinations D ON T.DesId = D.DesId;
GO

-- View 3: Tour phổ biến
-- [FIX] AVG dùng CAST sang DECIMAL để tránh làm tròn INT
CREATE VIEW vw_PopularTours AS
SELECT
    T.TourId,
    T.TourName,
    T.Price,
    T.DurationDays,
    C.CateName,
    D.DesName,
    AVG(CAST(R.Rating AS DECIMAL(3,1))) AS AvgRating,
    COUNT(DISTINCT R.ReviewId)          AS TotalReviews,
    COUNT(DISTINCT B.BookingId)         AS BookingCount
FROM Tours T
LEFT JOIN Reviews      R ON T.TourId = R.TourId
LEFT JOIN Categories   C ON T.CateId = C.CateId
LEFT JOIN Destinations D ON T.DesId  = D.DesId
LEFT JOIN TourSchedules S ON T.TourId = S.TourId
LEFT JOIN Bookings      B ON S.ScheduleId = B.ScheduleId
                         AND B.Status IN (N'Confirmed', N'Completed')
GROUP BY T.TourId, T.TourName, T.Price, T.DurationDays, C.CateName, D.DesName;
GO

-- ============================================================
-- SECTION 6: TRIGGERS
-- ============================================================

-- Trigger 1: Sau khi INSERT Booking → tự trừ AvailableSlots
-- [FIX] SP không UPDATE slot nữa — Trigger chịu trách nhiệm hoàn toàn
CREATE TRIGGER trg_AfterBookingInsert
ON Bookings
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE TS
    SET TS.AvailableSlots = TS.AvailableSlots - I.NumberOfPeople
    FROM TourSchedules TS
    JOIN inserted I ON TS.ScheduleId = I.ScheduleId;

    -- Tự động đặt Status = 'Full' nếu hết chỗ
    UPDATE TS
    SET TS.Status = N'Full'
    FROM TourSchedules TS
    JOIN inserted I ON TS.ScheduleId = I.ScheduleId
    WHERE TS.AvailableSlots = 0;
END;
GO

-- Trigger 2: Sau khi UPDATE Booking sang Cancelled → hoàn lại slot
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
        JOIN deleted  D ON D.BookingId   = I.BookingId
        WHERE I.Status = N'Cancelled'
          AND D.Status != N'Cancelled';

        -- Mở lại trạng thái 'Full' → 'Open' nếu có chỗ trở lại
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

INSERT INTO Categories (CateName, Description) VALUES
(N'Adventure',  N'Outdoor & thám hiểm'),
(N'Luxury',     N'Nghỉ dưỡng cao cấp'),
(N'Family',     N'Phù hợp gia đình'),
(N'Beach',      N'Tour biển');

INSERT INTO Destinations (DesName, Country, City, Description) VALUES
(N'Đà Lạt',   N'Việt Nam',  N'Lâm Đồng',  N'Thành phố sương mù'),
(N'Phú Quốc', N'Việt Nam',  N'Kiên Giang', N'Đảo ngọc'),
(N'Nha Trang', N'Việt Nam', N'Khánh Hòa',  N'Thành phố biển'),
(N'Bangkok',   N'Thái Lan', N'Bangkok',    N'Thủ đô Thái Lan');

INSERT INTO Employees (FullName, Role, Phone, Email) VALUES
(N'Nguyễn Văn A', N'Guide',    '0901234567', 'guide_a@travel.com'),
(N'Trần Thị B',   N'Guide',    '0902345678', 'guide_b@travel.com'),
(N'Lê Văn C',     N'Manager',  '0903333333', 'manager@travel.com');

INSERT INTO Tours (TourName, CateId, DesId, DurationDays, Price, MaxCapacity, Description, ImageUrl, IsActive) VALUES
(N'Tour Đà Lạt 3N2Đ',    1, 1, 3, 2500000, 20, N'Khám phá thành phố sương mù', NULL, 1),
(N'Tour Phú Quốc 4N3Đ',  2, 2, 4, 5000000, 25, N'Nghỉ dưỡng đảo ngọc',         NULL, 1),
(N'Tour Nha Trang 2N1Đ', 4, 3, 2, 1800000, 15, N'Biển xanh cát trắng',          NULL, 1),
(N'Tour Bangkok 5N4Đ',   2, 4, 5, 7500000, 20, N'Khám phá xứ chùa vàng',        NULL, 1);

INSERT INTO TourSchedules (TourId, DepartureDate, ReturnDate, AvailableSlots, EmployeeId, Status) VALUES
(1, '2026-06-01', '2026-06-03', 5,  1, N'Open'),
(2, '2026-06-15', '2026-06-18', 3,  2, N'Open'),
(3, '2026-07-01', '2026-07-02', 10, 3, N'Open'),
(4, '2026-07-20', '2026-07-24', 8,  1, N'Open'),
(1, '2026-08-01', '2026-08-03', 20, 2, N'Open');

-- Customers: PasswordHash để trống (sẽ được set bởi C# BCrypt khi đăng ký)
INSERT INTO Customers (FullName, Email, Phone, DateOfBirth, Address, PasswordHash, Role) VALUES
(N'Nguyễn Văn An',   'an@gmail.com',   '0911111111', '1995-01-15', N'TP.HCM', '', N'Customer'),
(N'Trần Thị Bình',   'binh@gmail.com', '0912222222', '1998-05-20', N'Hà Nội', '', N'Customer'),
(N'Lê Hoàng Cường',  'cuong@gmail.com','0913333333', '1990-09-10', N'Đà Nẵng','', N'Customer'),
(N'Admin System',    'admin@travel.com','0900000001', '1990-01-01', N'HCM',    '', N'Admin'),
(N'Nhân Viên 1',     'staff@travel.com','0900000002', '1995-01-01', N'HCM',   '', N'Staff');

-- Test sp_CreateBooking — Trigger sẽ tự trừ slot
EXEC sp_CreateBooking 1, 1, 2, 10;   -- An đặt 2 người, giảm 10% → slot còn 3
EXEC sp_CreateBooking 2, 2, 1, 0;    -- Bình đặt 1 người → slot còn 2
EXEC sp_CreateBooking 3, 3, 3, 5;    -- Cường đặt 3 người, giảm 5%

INSERT INTO BookingDetails (BookingId, PassengerName, PassengerDOB, PassengerPhone, IsPrimaryContact, PassengerType) VALUES
(1, N'Nguyễn Văn An',   '1995-01-15', '0911111111', 1, N'Adult'),
(1, N'Nguyễn Thị Mai',  '1997-03-20', '0911111112', 0, N'Adult'),
(2, N'Trần Thị Bình',   '1998-05-20', '0912222222', 1, N'Adult'),
(3, N'Lê Hoàng Cường',  '1990-09-10', '0913333333', 1, N'Adult'),
(3, N'Lê Thị Dung',     '2015-06-01', '0913333334', 0, N'Child'),
(3, N'Lê Văn Em',       '2018-12-01', '0913333335', 0, N'Child');

INSERT INTO Payments (BookingId, Amount, PaymentDate, PaymentMethod, Status, InvoiceCode, TransactionCode) VALUES
(1, 4500000, GETDATE(), N'VNPay',       N'Completed', dbo.fn_GenerateInvoiceCode(1), N'VNP20260601001'),
(2, 5000000, GETDATE(), N'BankTransfer',N'Completed', dbo.fn_GenerateInvoiceCode(2), NULL),
(3, 5130000, GETDATE(), N'MoMo',        N'Completed', dbo.fn_GenerateInvoiceCode(3), N'MOMO20260601003');

INSERT INTO Reviews (CustomerId, TourId, Rating, Comment) VALUES
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
SELECT dbo.fn_CustomerBookingCount(1, 2026)     AS BookingCount;
SELECT dbo.fn_GenerateInvoiceCode(99)           AS InvoiceCode;

PRINT '=== TEST 12: Trigger - đặt liên tiếp đến hết slot ===';
EXEC sp_CreateBooking 1, 1, 1, 0;
EXEC sp_CreateBooking 2, 1, 1, 0;
EXEC sp_CreateBooking 3, 1, 1, 0;
-- Lần này phải báo không đủ chỗ
EXEC sp_CreateBooking 1, 1, 1, 0;
SELECT ScheduleId, AvailableSlots, Status FROM TourSchedules WHERE ScheduleId = 1;
