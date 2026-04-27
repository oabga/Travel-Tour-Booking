CREATE DATABASE TravelBookingDB;
GO

USE TravelBookingDB;
GO

-- TABLES

CREATE TABLE Categories (
	CateId INT IDENTITY PRIMARY KEY,
	CateName NVARCHAR(100) NOT NULL,
	Description NVARCHAR(255)
);

CREATE TABLE Destinations (
	DesId INT IDENTITY PRIMARY KEY,
	DesName NVARCHAR(150),
	Country NVARCHAR(100),
	City NVARCHAR(100),
	Description NVARCHAR(255)
);

CREATE TABLE Tours (
	TourId INT IDENTITY PRIMARY KEY,
	TourName NVARCHAR(150),
	CateId INT,
	DesId INT,
	DurationDays INT CHECK(DurationDays > 0),
	Price DECIMAL(12,2) CHECK(Price > 0),
	MaxCapacity INT CHECK(MaxCapacity > 0),
	Description NVARCHAR(255),
	ImageUrl NVARCHAR(255),
	IsActive BIT DEFAULT 1,

	FOREIGN KEY (CateId) REFERENCES Categories(CateId),
	FOREIGN KEY (DesId) REFERENCES Destinations(DesId)
);

CREATE TABLE Employees (
	EmployeeId INT IDENTITY PRIMARY KEY,
	FullName NVARCHAR(150),
	Role NVARCHAR(50),
	Phone NVARCHAR(20),
	Email NVARCHAR(150) UNIQUE
);

CREATE TABLE TourSchedules (
	ScheduleId INT IDENTITY PRIMARY KEY,
	TourId INT,
	DepartureDate DATE,
	ReturnDate DATE,
	AvailableSlots INT CHECK(AvailableSlots >= 0),
	EmployeeId INT,
	Status NVARCHAR(50),

	FOREIGN KEY (TourId) REFERENCES Tours(TourId),
	FOREIGN KEY (EmployeeId) REFERENCES Employees(EmployeeId),
	CONSTRAINT CK_Date CHECK (ReturnDate > DepartureDate)
);

CREATE TABLE Customers (
	CustomerId INT IDENTITY PRIMARY KEY,
	FullName NVARCHAR(150),
	Email NVARCHAR(150) UNIQUE,
	Phone NVARCHAR(20),
	DateOfBirth DATE,
	Address NVARCHAR(255),
	CreatedAt DATETIME DEFAULT GETDATE()
);

CREATE TABLE Bookings (
	BookingId INT IDENTITY PRIMARY KEY,
	CustomerId INT,
	ScheduleId INT,
	BookingDate DATETIME DEFAULT GETDATE(),
	NumberOfPeople INT CHECK(NumberOfPeople > 0),
	TotalAmount DECIMAL(12,2),
	DiscountPercent DECIMAL(12,2),
	Status NVARCHAR(50),
	Notes NVARCHAR(255),

	FOREIGN KEY (CustomerId) REFERENCES Customers(CustomerId),
	FOREIGN KEY (ScheduleId) REFERENCES TourSchedules(ScheduleId)
);

CREATE TABLE BookingDetails (
	DetailId INT IDENTITY PRIMARY KEY,
	BookingId INT,
	PassengerName NVARCHAR(150),
	PassengerDOB DATE,
	PassengerPhone NVARCHAR(20),
	IsPrimaryContact BIT DEFAULT 0,

	FOREIGN KEY (BookingId) REFERENCES Bookings(BookingId)
);

CREATE TABLE Payments (
	PaymentId INT IDENTITY PRIMARY KEY,
	BookingId INT,
	Amount DECIMAL(12,2),
	PaymentDate DATETIME,
	PaymentMethod NVARCHAR(50),
	Status NVARCHAR(50),

	FOREIGN KEY (BookingId) REFERENCES Bookings(BookingId)
);

CREATE TABLE Reviews (
	ReviewId INT IDENTITY PRIMARY KEY,
	CustomerId INT,
	TourId INT,
	Rating INT CHECK(Rating BETWEEN 1 AND 5),
	Comment NVARCHAR(255),
	ReviewDate DATETIME DEFAULT GETDATE(),

	FOREIGN KEY (CustomerId) REFERENCES Customers(CustomerId),
	FOREIGN KEY (TourId) REFERENCES Tours(TourId)
);

-- FUNCTION

GO
CREATE FUNCTION fn_CalcBookingTotal(
@ScheduleId INT,
@NumberOfPeople INT,
@DiscountPercent DECIMAL(5,2))
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

-- STORED PROCEDURES

GO
CREATE PROCEDURE sp_CreateBooking
@CustomerId INT,
@ScheduleId INT,
@NumberOfPeople INT,
@DiscountPercent DECIMAL(5,2)
AS
BEGIN
	BEGIN TRANSACTION;

		DECLARE @Available INT;

		SELECT @Available = AvailableSlots
		FROM TourSchedules WITH (UPDLOCK, ROWLOCK)
		WHERE ScheduleId = @ScheduleId;

		IF @Available IS NULL
		BEGIN
			ROLLBACK;
			RAISERROR('Schedule not found', 16, 1);
			RETURN;
		END

		IF @Available < @NumberOfPeople
		BEGIN
			ROLLBACK;
			RAISERROR('Not enough slots', 16, 1);
			RETURN;
		END

		DECLARE @Total DECIMAL(12,2);
		SET @Total = dbo.fn_CalcBookingTotal(@ScheduleId, @NumberOfPeople, @DiscountPercent);

		INSERT INTO Bookings(CustomerId, ScheduleId, NumberOfPeople, TotalAmount, DiscountPercent, Status)
		VALUES (@CustomerId, @ScheduleId, @NumberOfPeople, @Total, @DiscountPercent, 'Confirmed');

		UPDATE TourSchedules
		SET AvailableSlots = AvailableSlots - @NumberOfPeople
		WHERE ScheduleId = @ScheduleId;
COMMIT;
END TRY
BEGIN CATCH
ROLLBACK;
RAISERROR('Create booking failed',16,1);
END CATCH
END;
GO

GO
CREATE PROCEDURE sp_CancelBooking
@BookingId INT
AS
BEGIN
	BEGIN TRANSACTION;

	IF EXISTS (
    SELECT 1 FROM Bookings 
    WHERE BookingId = @BookingId AND Status = 'Cancelled'
	)
	BEGIN
		ROLLBACK;
		RETURN;
	END

	DECLARE @ScheduleId INT, @People INT;

	SELECT @ScheduleId = ScheduleId,
		   @People = NumberOfPeople
	FROM Bookings
	WHERE BookingId = @BookingId;

	IF @ScheduleId IS NULL
	BEGIN
		ROLLBACK;
		RAISERROR('Booking not found', 16, 1);
		RETURN;
	END

	UPDATE Bookings
	SET Status = 'Cancelled'
	WHERE BookingId = @BookingId;

	UPDATE TourSchedules
	SET AvailableSlots = AvailableSlots + @People
	WHERE ScheduleId = @ScheduleId;
	COMMIT;
END;
GO

GO
CREATE PROCEDURE sp_SearchTours
@Destination NVARCHAR(100),
@PriceMin DECIMAL(12,2),
@PriceMax DECIMAL(12,2),
@Date DATE
AS
BEGIN
	SELECT T.*, D.DesName, S.DepartureDate
	FROM Tours T
	JOIN Destinations D ON T.DesId = D.DesId
	JOIN TourSchedules S ON T.TourId = S.TourId
	WHERE D.DesName LIKE '%' + @Destination + '%'
	AND T.Price BETWEEN @PriceMin AND @PriceMax
	AND S.DepartureDate >= @Date;
END;
GO

-- VIEWS

GO
CREATE VIEW vw_TourRevenue AS
SELECT T.TourId, T.TourName, D.DesName,
COUNT(B.BookingId) AS TotalBookings,
SUM(B.TotalAmount) AS TotalRevenue
FROM Tours T
JOIN Destinations D ON T.DesId = D.DesId
LEFT JOIN TourSchedules S ON T.TourId = S.TourId
LEFT JOIN Bookings B ON S.ScheduleId = B.ScheduleId AND B.Status = 'Confirmed'
GROUP BY T.TourId, T.TourName, D.DesName;
GO

GO
CREATE VIEW vw_BookingDetails AS
SELECT B.BookingId, C.FullName AS CustomerName, C.Phone,
T.TourName, S.DepartureDate, S.ReturnDate, B.NumberOfPeople,
B.TotalAmount, B.Status
FROM Bookings B
JOIN Customers C ON B.CustomerId = C.CustomerId
JOIN TourSchedules S ON B.ScheduleId = S.ScheduleId
JOIN Tours T ON S.TourId = T.TourId;
GO

GO
CREATE VIEW vw_PopularTours AS
SELECT T.TourId, T.TourName, T.Price, AVG(R.Rating) AS AvgRating,
COUNT(B.BookingId) AS BookingCount
FROM Tours T
LEFT JOIN Reviews R ON T.TourId = R.TourId
LEFT JOIN TourSchedules S ON T.TourId = S.TourId
LEFT JOIN Bookings B ON S.ScheduleId = B.ScheduleId
GROUP BY T.TourId, T.TourName, T.Price;
GO

-- SEED DATA

INSERT INTO Categories VALUES
(N'Adventure', N'Outdoor'),
(N'Luxury', N'High-end'),
(N'Family', N'Family friendly'),
(N'Beach', N'Sea tours');

INSERT INTO Destinations VALUES
(N'Đà Lạt', N'Việt Nam', N'Lâm Đồng', N'Thành phố sương mù'),
(N'Phú Quốc', N'Việt Nam', N'Kiên Giang', N'Đảo biển'),
(N'Nha Trang', N'Việt Nam', N'Khánh Hòa', N'Beach city'),
(N'Bangkok', N'Thái Lan', N'Bangkok', N'Thủ đô');

INSERT INTO Employees VALUES
(N'Nguyễn Văn A', N'Sales', '0901234567', 'a@gmail.com'),
(N'Trần Thị B', N'Operator', '0902345678', 'b@gmail.com'),
(N'Lê Văn C', N'Manager', '0903333333', 'c@gmail.com');

INSERT INTO Tours VALUES
(N'Tour Đà Lạt 3N2Đ', 1, 1, 3, 2500000, 20, N'Du lịch Đà Lạt', NULL, 1),
(N'Tour Phú Quốc 4N3Đ', 2, 2, 4, 5000000, 25, N'Nghỉ dưỡng', NULL, 1),
(N'Tour Nha Trang 2N1Đ', 4, 3, 2, 1800000, 15, N'Beach short trip', NULL, 1);

INSERT INTO TourSchedules VALUES
(1, '2026-05-01', '2026-05-03', 5, 1, 'Open'),
(2, '2026-06-01', '2026-06-04', 3, 2, 'Open'),
(3, '2026-07-10', '2026-07-12', 10, 3, 'Open');

INSERT INTO Customers VALUES
(N'Nguyễn A', 'a1@gmail.com', '0911111111', '2000-01-01', N'HCM', GETDATE()),
(N'Nguyễn B', 'b1@gmail.com', '0912222222', '1999-02-02', N'HN', GETDATE()),
(N'Nguyễn C', 'c1@gmail.com', '0913333333', '1998-03-03', N'DN', GETDATE());

-- TEST
EXEC sp_CreateBooking 1, 1, 2, 10;
EXEC sp_CreateBooking 2, 2, 1, 0;
EXEC sp_CreateBooking 3, 3, 3, 5;
--khong du slot
EXEC sp_CreateBooking 1, 1, 10, 0;
--khong thay lich
EXEC sp_CreateBooking 1, 999, 2, 0;

EXEC sp_CancelBooking 1;
SELECT * FROM TourSchedules;

--cancel lần 2
EXEC sp_CancelBooking 2;
EXEC sp_CancelBooking 2;
SELECT * FROM TourSchedules;

EXEC sp_SearchTours N'Đà Lạt', 1000000, 5000000, '2026-01-01';

SELECT * FROM vw_TourRevenue;
SELECT * FROM vw_BookingDetails;
SELECT * FROM vw_PopularTours;

EXEC sp_CreateBooking 1, 1, 1, 0;
EXEC sp_CreateBooking 2, 1, 1, 0;
EXEC sp_CreateBooking 3, 1, 1, 0;
EXEC sp_CreateBooking 1, 1, 1, 0;
EXEC sp_CreateBooking 2, 1, 1, 0;
SELECT * FROM TourSchedules WHERE ScheduleId = 1;
