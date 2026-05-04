# 🌏 TravelBookingDB — Hệ thống Đặt Tour Du lịch

> **Môn học:** Lập trình Cơ sở Dữ liệu  
> **Stack:** C# · ASP.NET Core Web API · SQL Server · Entity Framework Core · Angular 17  
> **Nhóm:** 5 người

---

## 📋 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Tính năng](#-tính-năng)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Database Schema](#-database-schema)
- [Cấu trúc Solution](#-cấu-trúc-solution)
- [T-SQL Objects](#-t-sql-objects)
- [API Endpoints](#-api-endpoints)
- [Hướng dẫn cài đặt](#-hướng-dẫn-cài-đặt)
- [Phân công nhóm](#-phân-công-nhóm)
- [Checklist nộp bài](#-checklist-nộp-bài)

---

## 🌟 Giới thiệu

Hệ thống **Travel Tour Booking** là ứng dụng quản lý và đặt tour du lịch trực tuyến, được xây dựng theo kiến trúc **3-layer (3 tầng)** với ASP.NET Core Web API. Hệ thống đáp ứng đầy đủ các yêu cầu kỹ thuật môn Lập trình CSDL:

| Yêu cầu | Nghiệp vụ tương ứng |
|---------|---------------------|
| **Transaction** | Đặt tour: kiểm tra slot → tạo booking → cập nhật chỗ (ACID) |
| **Trigger** | Tự động cập nhật `AvailableSlots` khi booking được tạo hoặc hủy |
| **View** | Doanh thu theo tour, tour phổ biến, chi tiết đơn hàng |
| **Stored Procedure** | Tìm tour, tạo booking, hủy booking, báo cáo doanh thu |
| **Function** | Tính giá sau giảm giá, đếm booking theo năm, sinh mã hóa đơn |
| **LINQ to XML** | Export/Import danh sách tour và booking ra file XML |

---

## ✨ Tính năng

### 1. Nhóm Quản lý Tour & Điểm đến (Catalog)

- **Xem danh sách Tour** — Phân trang (Pagination) và lọc theo danh mục, điểm đến, khoảng giá
- **Tìm kiếm Tour nâng cao** — Tìm theo điểm đến, khoảng giá, ngày khởi hành (dùng `sp_SearchTours`)
- **Xem chi tiết Tour** — Thông tin mô tả, hình ảnh, lịch khởi hành, điểm đánh giá trung bình
- **Quản lý Tour (Admin)** — Thêm, Sửa, Xóa thông tin tour
- **Quản lý Loại hình (Categories)** — CRUD: Trong nước, Quốc tế, Mạo hiểm, Nghỉ dưỡng
- **Quản lý Điểm đến (Destinations)** — CRUD địa danh (tên, quốc gia, thành phố)
- **Quản lý Lịch khởi hành (TourSchedules)** — Ngày đi/về, tổng số chỗ, hướng dẫn viên
- **Theo dõi số chỗ còn trống** — Cập nhật real-time qua Trigger khi có booking mới hoặc bị hủy

### 2. Nhóm Nghiệp vụ Đặt Tour (Booking Workflow)

- **Đặt Tour** — Dùng `sp_CreateBooking` trong `BEGIN TRANSACTION`: kiểm tra slot, tính giá qua `fn_CalcBookingTotal`, lưu Booking + BookingDetails, Trigger tự trừ slot
- **Nhập danh sách Hành khách** — Ghi nhận thông tin từng hành khách (họ tên, ngày sinh, SĐT). Phân loại **Người lớn / Trẻ em** (`PassengerType`) để tính giá khác nhau
- **Hủy Booking** — Cập nhật `Status = 'Cancelled'` (ràng buộc CHECK constraint: Pending → Confirmed → Completed → Cancelled), Trigger `trg_AfterBookingCancel` hoàn lại slot
- **Xem chi tiết Đơn hàng** — Dùng `vw_BookingDetails` (JOIN 4 bảng) kèm danh sách hành khách
- **Lịch sử đặt tour** — Xem tất cả booking của khách, lọc theo trạng thái

### 3. Nhóm Quản lý Khách hàng & Phản hồi

- **Đăng ký / Đăng nhập** — JWT Authentication với `PasswordHash` (BCrypt) và `Role` lưu trong bảng `Customers`. Phân quyền 3 cấp: Admin / Staff / Customer
- **Phân quyền (RBAC)** — 3 cấp độ rõ ràng, dùng `[Authorize(Roles="...")]` trên từng endpoint:
  - `Admin` — toàn quyền: CRUD Tour, Categories, Destinations, Employees, xem báo cáo doanh thu, Export/Import XML
  - `Staff` — chỉ xem: xem danh sách tour, xem danh sách booking (không tạo, không sửa, không xóa)
  - `Customer` — đặt tour, hủy booking của mình, đánh giá tour, xem lịch sử cá nhân
- **Quản lý Nhân viên (Admin only)** — CRUD hồ sơ nhân viên / hướng dẫn viên (bảng `Employees`). **Lưu ý:** `Employees` và tài khoản đăng nhập là 2 khái niệm tách biệt — Employee không đăng nhập hệ thống, chỉ được Admin phân công vào `TourSchedules.EmployeeId` để dẫn tour
- **Quản lý hồ sơ cá nhân** — Xem và cập nhật thông tin khách hàng
- **Đánh giá Tour (Reviews)** — Chấm 1–5 sao, viết bình luận (chỉ khách có booking Completed)
- **Thống kê cá nhân** — Đếm số booking trong năm (`fn_CustomerBookingCount`)

### 4. Nhóm Thanh toán & Nhân sự

- **Ghi nhận Thanh toán** — Hỗ trợ đặt cọc hoặc thanh toán toàn phần (VNPay, MoMo, chuyển khoản). Lưu `TransactionCode` cho đối soát
- **Sinh mã Hóa đơn** — Tự động tạo mã `INV-2026-0001` qua `fn_GenerateInvoiceCode`, lưu vào cột `InvoiceCode` của bảng `Payments`
- **Xem lịch sử Thanh toán** — Tổng đã trả, còn nợ bao nhiêu (LINQ Sum)

### 5. Nhóm Báo cáo & Hệ thống

- **Doanh thu theo Tour** — Truy vấn `vw_TourRevenue`
- **Tour phổ biến nhất** — Xếp hạng theo rating + lượt đặt từ `vw_PopularTours`
- **Doanh thu theo tháng** — `sp_RevenueReport` với `GROUP BY` tháng
- **Tỷ lệ lấp đầy (Occupancy Rate)** — Phần trăm chỗ đã bán / tổng chỗ
- **Xuất / Nhập XML** — Export/Import tour và booking qua LINQ to XML (`XDocument`)

---

## 🏗 Kiến trúc hệ thống

```
┌─────────────────────────────────────────┐
│   Frontend — Angular 17                 │  Standalone Components
│   Pages · Services · Guards             │  Chart.js · HttpClient
│   Interceptors (JWT attach)             │  Angular Router
└────────────────┬────────────────────────┘
                 │  HTTP/REST (JSON)  port 4200 → 5001
                 ▼
┌─────────────────────────────┐
│   Layer 1 — Presentation    │  ASP.NET Core Web API
│   Controllers · DTOs        │  JWT · Swagger · Middleware
│   Middleware · AutoMapper    │  CORS cho Angular
└────────────┬────────────────┘
             │ Interface
             ▼
┌─────────────────────────────┐
│   Layer 2 — Business Logic  │  Services · Validators
│   TourService               │  Business Rules · LINQ to Objects
│   BookingService            │  LINQ to XML
│   PaymentService · ...      │
└────────────┬────────────────┘
             │ Interface
             ▼
┌─────────────────────────────┐
│   Layer 3 — Data Access     │  EF Core · ADO.NET
│   Repositories              │  Repository Pattern
│   EF DbContext              │  LINQ to Entities
│   ADO.NET (DataSet)         │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│       SQL Server            │  Views · Stored Procedures
│   TravelBookingDB           │  Functions · Triggers
└─────────────────────────────┘
```

---

## 🗄 Database Schema

**10 bảng:**

```
Categories ──┐
             ├──► Tours ──► TourSchedules ──► Bookings ──► BookingDetails
Destinations ┘                   │                │
                                 │                ├──► Payments
Employees ───────────────────────┘                │
                                                  └──► (Reviews ◄── Tours)
Customers ───────────────────────────────────────►┘
```

> **Lưu ý phân biệt `Customers` và `Employees`:**
> - `Customers` — tài khoản đăng nhập hệ thống, có `PasswordHash` và `Role` (Admin / Staff / Customer). **Admin là người tạo/sửa/xóa Tour.**
> - `Employees` — hồ sơ nhân sự hướng dẫn viên, **không đăng nhập hệ thống**. Admin phân công Employee vào `TourSchedules.EmployeeId` để chỉ định ai dẫn tour nào.
> - Một người thực tế có thể vừa có tài khoản `Customers` (Role=Staff) vừa có hồ sơ `Employees`, nhưng trong DB đây là 2 record độc lập ở 2 bảng khác nhau.

| Bảng | Mô tả | Số cột |
|------|-------|--------|
| `Categories` | Loại hình tour | 3 |
| `Destinations` | Điểm đến | 5 |
| `Tours` | Thông tin tour | 10 |
| `Employees` | Hướng dẫn viên (không đăng nhập) | 5 |
| `TourSchedules` | Lịch khởi hành | 7 |
| `Customers` | Tài khoản đăng nhập + Auth (PasswordHash, Role) | 9 |
| `Bookings` | Đơn đặt tour | 9 |
| `BookingDetails` | Danh sách hành khách (có PassengerType) | 6 |
| `Payments` | Thanh toán (có InvoiceCode, TransactionCode) | 8 |
| `Reviews` | Đánh giá | 6 |

---

## 📁 Cấu trúc Solution

```
TravelTourBooking/
├── TravelTourBooking.sln
├── src/                                     # Backend .NET
│   ├── TravelTourBooking.API/               # Layer 1 — Presentation
│   │   ├── Controllers/
│   │   │   ├── ToursController.cs
│   │   │   ├── BookingsController.cs
│   │   │   ├── CategoriesController.cs
│   │   │   ├── DestinationsController.cs
│   │   │   ├── SchedulesController.cs
│   │   │   ├── CustomersController.cs
│   │   │   ├── AuthController.cs
│   │   │   ├── PaymentsController.cs
│   │   │   ├── ReviewsController.cs
│   │   │   ├── EmployeesController.cs        # Admin duyệt staff / quản lý nhân viên
│   │   │   ├── ReportsController.cs
│   │   │   └── ExportController.cs
│   │   ├── DTOs/
│   │   │   ├── TourDto.cs
│   │   │   ├── BookingDto.cs
│   │   │   ├── PaymentDto.cs
│   │   │   ├── AuthDto.cs
│   │   │   └── ReportDto.cs
│   │   ├── Middleware/
│   │   │   ├── ExceptionMiddleware.cs
│   │   │   └── JwtMiddleware.cs
│   │   ├── appsettings.json
│   │   └── Program.cs
│   │
│   ├── TravelTourBooking.BLL/               # Layer 2 — Business Logic
│   │   ├── Interfaces/
│   │   │   ├── ITourService.cs
│   │   │   ├── IBookingService.cs
│   │   │   ├── IPaymentService.cs
│   │   │   ├── IReportService.cs
│   │   │   ├── IAuthService.cs
│   │   │   └── IXmlService.cs
│   │   ├── Services/
│   │   │   ├── TourService.cs
│   │   │   ├── BookingService.cs
│   │   │   ├── PaymentService.cs
│   │   │   ├── ReportService.cs
│   │   │   ├── AuthService.cs
│   │   │   ├── ReviewService.cs
│   │   │   └── XmlService.cs
│   │   └── Validators/
│   │       ├── BookingValidator.cs
│   │       └── TourValidator.cs
│   │
│   ├── TravelTourBooking.DAL/               # Layer 3 — Data Access
│   │   ├── EFCore/
│   │   │   ├── AppDbContext.cs
│   │   │   ├── Entities/
│   │   │   │   ├── Tour.cs
│   │   │   │   ├── TourSchedule.cs
│   │   │   │   ├── Booking.cs
│   │   │   │   ├── BookingDetail.cs
│   │   │   │   ├── Payment.cs
│   │   │   │   ├── Customer.cs
│   │   │   │   ├── Category.cs
│   │   │   │   ├── Destination.cs
│   │   │   │   ├── Review.cs
│   │   │   │   └── Employee.cs
│   │   │   ├── Configurations/
│   │   │   │   ├── TourConfiguration.cs
│   │   │   │   └── BookingConfiguration.cs
│   │   │   └── Migrations/
│   │   ├── ADO/
│   │   │   ├── AdoConnectionFactory.cs
│   │   │   └── AdoTourRepository.cs
│   │   └── Repositories/
│   │       ├── Interfaces/
│   │       │   ├── IRepository.cs
│   │       │   ├── ITourRepository.cs
│   │       │   ├── IBookingRepository.cs
│   │       │   └── IReportRepository.cs
│   │       ├── GenericRepository.cs
│   │       ├── TourRepository.cs
│   │       ├── BookingRepository.cs
│   │       ├── ReportRepository.cs
│   │       └── PaymentRepository.cs
│   │
│   └── TravelTourBooking.Common/            # Shared
│       ├── DTOs/
│       │   ├── ApiResponse.cs
│       │   └── PaginationDto.cs
│       ├── Enums/
│       │   ├── BookingStatus.cs
│       │   └── PaymentMethod.cs
│       └── Helpers/
│           ├── MappingProfile.cs
│           └── JwtHelper.cs
│
├── frontend/                                # Angular 17 App
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/                        # Singleton services, guards, interceptors
│   │   │   │   ├── guards/
│   │   │   │   │   └── auth.guard.ts        # Chặn route nếu chưa đăng nhập
│   │   │   │   ├── interceptors/
│   │   │   │   │   └── jwt.interceptor.ts   # Tự động đính JWT vào mọi request
│   │   │   │   └── services/
│   │   │   │       └── auth.service.ts      # Lưu token, decode role
│   │   │   ├── shared/                      # Components & models dùng chung
│   │   │   │   ├── components/
│   │   │   │   │   ├── navbar/
│   │   │   │   │   └── pagination/
│   │   │   │   └── models/                  # Interface TypeScript map với DTO backend
│   │   │   │       ├── tour.model.ts
│   │   │   │       ├── booking.model.ts
│   │   │   │       └── report.model.ts
│   │   │   ├── features/                    # Từng module chức năng
│   │   │   │   ├── tours/
│   │   │   │   │   ├── tour-list/           # Danh sách + filter + pagination
│   │   │   │   │   ├── tour-detail/         # Chi tiết tour + lịch khởi hành
│   │   │   │   │   └── tour-search/         # Tìm kiếm nâng cao
│   │   │   │   ├── bookings/
│   │   │   │   │   ├── booking-form/        # Form đặt tour + nhập hành khách
│   │   │   │   │   └── booking-history/     # Lịch sử đặt tour của khách
│   │   │   │   ├── dashboard/               # Admin dashboard
│   │   │   │   │   └── dashboard.component.ts  # Chart.js: doanh thu, tour phổ biến
│   │   │   │   └── auth/
│   │   │   │       ├── login/
│   │   │   │       └── register/
│   │   │   ├── services/                    # Gọi API backend
│   │   │   │   ├── tour.service.ts
│   │   │   │   ├── booking.service.ts
│   │   │   │   ├── payment.service.ts
│   │   │   │   └── report.service.ts
│   │   │   ├── app.routes.ts                # Định nghĩa routes + lazy loading
│   │   │   └── app.component.ts
│   │   ├── assets/
│   │   │   └── images/
│   │   └── environments/
│   │       ├── environment.ts               # apiUrl: 'http://localhost:5001/api'
│   │       └── environment.prod.ts
│   ├── angular.json
│   ├── package.json
│   └── tsconfig.json
│
├── database/                                # T-SQL Scripts
│   ├── 01_CreateDatabase.sql
│   ├── 02_CreateTables.sql
│   ├── 03_Views.sql
│   ├── 04_Functions.sql
│   ├── 05_StoredProcedures.sql
│   ├── 06_Triggers.sql
│   ├── 07_SeedData.sql
│   └── 08_Transactions.sql
│
├── docs/
│   └── report/
│       ├── main.tex
│       └── chapters/
│           ├── ch1_intro.tex
│           ├── ch2_theory.tex
│           ├── ch3_design.tex
│           ├── ch4_impl.tex
│           └── ch5_conclusion.tex
│
├── TravelTour.postman_collection.json
└── README.md
```

---

## 🗃 T-SQL Objects

### Views (3)

| View | Mô tả |
|------|-------|
| `vw_TourRevenue` | Doanh thu và số booking theo từng tour (chỉ Confirmed) |
| `vw_BookingDetails` | Chi tiết đơn hàng — JOIN Bookings + Customers + TourSchedules + Tours |
| `vw_PopularTours` | Xếp hạng tour theo AVG Rating và tổng lượt đặt |

### Functions (3)

| Function | Input | Output | Mô tả |
|----------|-------|--------|-------|
| `fn_CalcBookingTotal` | ScheduleId, NumberOfPeople, DiscountPercent | DECIMAL | Tính tổng tiền sau giảm giá |
| `fn_CustomerBookingCount` | CustomerId, Year | INT | Đếm số booking của khách trong năm |
| `fn_GenerateInvoiceCode` | BookingId | NVARCHAR | Sinh mã hóa đơn `INV-2026-0001` |
| `fn_IsEmployeeVerified` | EmployeeId | BIT | Kiểm tra staff đã được admin duyệt hay chưa |

### Stored Procedures (4)

| SP | Mô tả |
|----|-------|
| `sp_CreateBooking` | Tạo booking trong TRANSACTION: kiểm tra slot (UPDLOCK) → tính giá → INSERT Booking — Trigger tự trừ slot |
| `sp_CancelBooking` | Hủy booking, hoàn slot, không cho cancel lần 2 |
| `sp_SearchTours` | Tìm tour theo điểm đến, khoảng giá, ngày khởi hành (tham số optional NULL) |
| `sp_ApproveEmployee` | Admin duyệt staff, cập nhật `IsVerified = 1` cho tài khoản nhân viên |
| `sp_RevenueReport` | Báo cáo doanh thu GROUP BY tháng trong khoảng thời gian |

### Triggers (2)

| Trigger | Sự kiện | Hành động |
|---------|---------|-----------|
| `trg_AfterBookingInsert` | AFTER INSERT trên Bookings | Trừ `AvailableSlots` tương ứng trong TourSchedules |
| `trg_AfterBookingCancel` | AFTER UPDATE khi Status → 'Cancelled' | Cộng lại `AvailableSlots` vào TourSchedules |

---

## 🔌 API Endpoints

### Tours
```
GET    /api/tours                                        Danh sách tour (pagination + filter) — Public
GET    /api/tours/{id}                                   Chi tiết tour — Public
POST   /api/tours                                        Thêm tour [Admin only]
PUT    /api/tours/{id}                                   Sửa tour [Admin only]
DELETE /api/tours/{id}                                   Xóa tour [Admin only]
GET    /api/tours/search?dest=&priceMin=&priceMax=&date= Tìm kiếm nâng cao — Public
```

### Bookings
```
POST   /api/bookings                      Đặt tour → sp_CreateBooking
GET    /api/bookings/{id}                 Chi tiết booking (vw_BookingDetails)
PUT    /api/bookings/{id}/cancel          Hủy booking → sp_CancelBooking
GET    /api/bookings/customer/{id}        Lịch sử booking của khách hàng
```

### Auth & Customers
```
POST   /api/auth/register                 Đăng ký tài khoản
POST   /api/auth/login                    Đăng nhập → JWT token
GET    /api/customers/{id}                Xem hồ sơ
PUT    /api/customers/{id}                Cập nhật hồ sơ
```

### Employees / Staff Approval
```
GET    /api/employees/pending             Danh sách staff chờ duyệt [Admin]
PUT    /api/employees/{id}/approve        Duyệt staff → set IsVerified = 1 [Admin]
PUT    /api/employees/{id}/reject         Từ chối staff [Admin]
GET    /api/employees                     Danh sách nhân viên [Admin]
```

### Reports
```
GET    /api/reports/revenue               Doanh thu theo tour (vw_TourRevenue)
GET    /api/reports/popular-tours         Tour phổ biến (vw_PopularTours)
GET    /api/reports/revenue-by-month      Doanh thu theo tháng (sp_RevenueReport)
GET    /api/reports/occupancy             Tỷ lệ lấp đầy
```

### Khác
```
GET    /api/categories                    Danh sách loại hình — Public
GET    /api/destinations                  Danh sách điểm đến — Public
POST   /api/payments                      Ghi nhận thanh toán [Customer]
GET    /api/payments/booking/{id}         Lịch sử thanh toán [Customer/Admin]
POST   /api/reviews                       Đăng đánh giá tour [Customer — phải có Booking Completed]
GET    /api/employees                     Danh sách nhân viên/HDV [Admin]
POST   /api/employees                     Thêm nhân viên/HDV [Admin]
PUT    /api/employees/{id}               Sửa nhân viên/HDV [Admin]
DELETE /api/employees/{id}               Xóa nhân viên/HDV [Admin]
GET    /api/export/tours/xml              Xuất tour ra XML (LINQ to XML) [Admin]
POST   /api/import/tours/xml              Nhập tour từ XML [Admin]
```

---

## 🚀 Hướng dẫn cài đặt

### Yêu cầu

- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [SQL Server 2022+](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) hoặc SQL Server Express
- [SQL Server Management Studio (SSMS)](https://aka.ms/ssmsfullsetup)
- [Visual Studio 2022](https://visualstudio.microsoft.com/) hoặc VS Code
- [Node.js 20+](https://nodejs.org/) và Angular CLI (`npm install -g @angular/cli`)

### Bước 1 — Clone repository

```bash
git clone https://github.com/<your-org>/TravelTourBooking.git
cd TravelTourBooking
```

### Bước 2 — Tạo Database

Mở SSMS, chạy các script theo đúng thứ tự:

```
database/01_CreateDatabase.sql      ← Tạo database
database/02_CreateTables.sql        ← Tạo 10 bảng + constraints
database/03_Views.sql               ← Tạo 3 Views
database/04_Functions.sql           ← Tạo 3 Functions
database/05_StoredProcedures.sql    ← Tạo 4 Stored Procedures
database/06_Triggers.sql            ← Tạo 2 Triggers
database/07_SeedData.sql            ← Insert dữ liệu mẫu
```

### Bước 3 — Cấu hình Connection String

Mở `src/TravelTourBooking.API/appsettings.json` và cập nhật:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=TravelBookingDB;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  "JwtSettings": {
    "SecretKey": "your-secret-key-min-32-characters",
    "Issuer": "TravelTourBooking",
    "Audience": "TravelTourBookingClient",
    "ExpiryMinutes": 60
  }
}
```

### Bước 4 — Restore & Run Backend

```bash
cd src/TravelTourBooking.API
dotnet restore
dotnet run
```

### Bước 5 — Cấu hình CORS (đã có sẵn trong Program.cs)

Backend cho phép Angular gọi API từ `localhost:4200`:

```csharp
builder.Services.AddCors(options => {
    options.AddPolicy("AllowAngular", policy => {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader().AllowAnyMethod();
    });
});
app.UseCors("AllowAngular");
```

### Bước 6 — Chạy Frontend Angular

Mở terminal mới (song song với backend):

```bash
cd frontend
npm install
ng serve
```

Truy cập Angular app: `http://localhost:4200`

### Bước 7 — Mở Swagger UI

Truy cập: `https://localhost:5001/swagger`

---

## 👥 Phân công nhóm

| Thành viên | Branch Git | Nhóm chức năng | Trách nhiệm chính |
|-----------|-----------|----------------|-------------------|
| **TV1** | `feature/catalog` | Quản lý Tour & Điểm đến | CRUD Tours (Admin only), Categories, Destinations, TourSchedules, `sp_SearchTours`, `vw_PopularTours`, Export/Import XML |
| **TV2** | `feature/booking` | Đặt Tour & Hành khách | `sp_CreateBooking`, `sp_CancelBooking`, BookingDetails, `trg_AfterBookingInsert`, `trg_AfterBookingCancel`, `vw_BookingDetails` |
| **TV3** | `feature/auth-customer` | Khách hàng & Bảo mật | Đăng ký/Đăng nhập JWT, RBAC `[Authorize]`, hồ sơ cá nhân, Reviews, `fn_CustomerBookingCount` |
| **TV4** | `feature/payment-employee` | Thanh toán & Nhân sự | Payments, `fn_GenerateInvoiceCode`, InvoiceCode, CRUD Employees, phân công HDV |
| **TV5** | `feature/report` | Báo cáo & Hệ thống | `vw_TourRevenue`, `sp_RevenueReport`, Occupancy Rate, Dashboard Angular + Chart.js |

### Khởi tạo branch

```bash
git checkout -b feature/catalog          # TV1
git checkout -b feature/booking          # TV2
git checkout -b feature/auth-customer    # TV3
git checkout -b feature/payment-employee # TV4
git checkout -b feature/report           # TV5
```

### Thứ tự dependency khi merge vào main

```
feature/catalog  ──────────────────────────────► main
feature/booking  ── (cần catalog trước) ────────► main
feature/auth-customer ── (độc lập) ─────────────► main
feature/payment-employee ── (cần booking trước) ► main
feature/report ── (cần tất cả xong) ────────────► main
```

---

## 🔐 Bảng phân quyền (RBAC)

| Chức năng | Admin | Staff | Customer |
|-----------|:-----:|:-----:|:--------:|
| Xem danh sách / chi tiết tour | ✅ | ✅ | ✅ |
| Tìm kiếm tour | ✅ | ✅ | ✅ |
| **CRUD Tour** | ✅ | ❌ | ❌ |
| **CRUD Categories / Destinations** | ✅ | ❌ | ❌ |
| **CRUD Employees** | ✅ | ❌ | ❌ |
| Xem danh sách booking | ✅ | ✅ | ❌ |
| **Đặt tour** | ❌ | ❌ | ✅ |
| **Hủy booking của mình** | ❌ | ❌ | ✅ |
| Xem booking của mình | ❌ | ❌ | ✅ |
| **Đánh giá tour** | ❌ | ❌ | ✅ (cần Booking Completed) |
| Ghi nhận thanh toán | ✅ | ✅ | ✅ |
| **Xem báo cáo doanh thu** | ✅ | ❌ | ❌ |
| **Export / Import XML** | ✅ | ❌ | ❌ |

> `[AllowAnonymous]` — Xem danh sách tour, chi tiết tour, tìm kiếm: không cần đăng nhập  
> `[Authorize(Roles = "Admin")]` — CRUD Tour, Categories, Destinations, Employees, Reports, XML  
> `[Authorize(Roles = "Admin,Staff")]` — Xem danh sách booking  
> `[Authorize(Roles = "Customer")]` — Đặt tour, hủy, đánh giá  
> `[Authorize]` — Ghi nhận thanh toán, xem lịch sử cá nhân

---

## ✅ Checklist nộp bài

### T-SQL
- [ ] ≥ 3 Views (`vw_TourRevenue`, `vw_BookingDetails`, `vw_PopularTours`)
- [ ] ≥ 3 Functions (`fn_CalcBookingTotal`, `fn_CustomerBookingCount`, `fn_GenerateInvoiceCode`)
- [ ] ≥ 4 Stored Procedures (`sp_CreateBooking`, `sp_CancelBooking`, `sp_SearchTours`, `sp_RevenueReport`)
- [ ] ≥ 2 Triggers (`trg_AfterBookingInsert`, `trg_AfterBookingCancel`)
- [ ] Transaction với TRY-CATCH trong `sp_CreateBooking`
- [ ] Luồng duyệt staff: `Employees.IsVerified` + `sp_ApproveEmployee` + kiểm tra khi login

### Architecture
- [ ] 4 projects: `.API` / `.BLL` / `.DAL` / `.Common`
- [ ] Controller không gọi thẳng DbContext
- [ ] Service không reference EF namespace trực tiếp
- [ ] Mọi giao tiếp giữa layer qua Interface

### Data Access
- [ ] EF Core Code First (migration)
- [ ] EF Core Database First (scaffold từ SQL script)
- [ ] ADO.NET Connected model (`SqlConnection` + `SqlDataReader`)
- [ ] ADO.NET Disconnected model (`DataSet` + `DataAdapter`)
- [ ] Repository Pattern (Generic + Specific)

### LINQ
- [ ] LINQ to Objects (business rule validation trong BLL)
- [ ] LINQ to Entities (truy vấn EF với `Where`, `Include`, `OrderBy`, `GroupBy`)
- [ ] LINQ to XML (export/import XML)

### API
- [ ] RESTful API + đầy đủ HTTP status codes (200, 201, 400, 404, 409)
- [ ] Swagger UI hoạt động với XML doc comments
- [ ] JWT Authentication + Role-based Authorization
- [ ] Global Exception Middleware
- [ ] DTOs tách biệt hoàn toàn với Entities
- [ ] AutoMapper

### Frontend Angular
- [ ] Trang danh sách tour với filter và pagination
- [ ] Trang chi tiết tour + lịch khởi hành
- [ ] Form đặt tour + nhập danh sách hành khách
- [ ] Trang lịch sử booking của khách hàng
- [ ] Dashboard Admin với biểu đồ Chart.js (doanh thu theo tháng, tour phổ biến)
- [ ] Trang đăng nhập / đăng ký
- [ ] JWT Interceptor tự đính token vào request
- [ ] Auth Guard bảo vệ route Admin

### Nộp bài
- [ ] GitHub public + README đầy đủ
- [ ] Postman collection test ≥ 15 endpoints
- [ ] Báo cáo LaTeX 5 chương
- [ ] Seed data đủ để demo (Tours, Schedules, Customers, Bookings, Reviews)
- [ ] Mỗi thành viên hiểu toàn bộ project (chuẩn bị vấn đáp)

---

## 🛠 Tech Stack

| Thành phần | Công nghệ |
|-----------|-----------|
| Frontend Framework | Angular 17 (Standalone Components) |
| UI Charts | Chart.js (biểu đồ doanh thu dashboard) |
| Backend Framework | ASP.NET Core 8 Web API |
| ORM | Entity Framework Core 8 |
| Database | SQL Server 2019+ |
| Authentication | JWT Bearer Token |
| Object Mapping | AutoMapper |
| Validation | FluentValidation |
| API Documentation | Swashbuckle (Swagger UI) |
| Password Hashing | BCrypt.Net |
| Report Format | LaTeX |
| Version Control | Git / GitHub |

---

## 📄 License

MIT License — Đồ án học thuật, nhóm 5 người.
