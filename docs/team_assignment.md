# 👥 Phân công Chi tiết — Từng Người, Từng Module

> **Đề tài:** Travel Tour Booking | **Frontend:** React + Vite | **Backend:** ASP.NET Core Web API

---

## 0. Frontend dùng gì?

| Lựa chọn | Lý do |
|-----------|-------|
| **React + Vite** ✅ | Phổ biến, dễ demo đẹp, gọi REST API đơn giản, nhiều UI library hỗ trợ |
| UI Library | **Ant Design** hoặc **MUI** — có sẵn Table, Form, Card, Notification |
| HTTP Client | **Axios** — gọi Web API |
| Routing | **React Router v6** |

> [!NOTE]
> Frontend **không phải trọng tâm** đánh giá (môn này tập trung DB + Backend). Chỉ cần đủ để **demo các chức năng** khi vấn đáp. Không cần quá phức tạp.

### Cấu trúc Frontend

```
travel-tour-frontend/
├── src/
│   ├── pages/
│   │   ├── TourListPage.jsx        # Danh sách tour, tìm kiếm, filter
│   │   ├── TourDetailPage.jsx      # Chi tiết tour + đặt tour
│   │   ├── BookingPage.jsx         # Form đặt tour
│   │   ├── BookingHistoryPage.jsx  # Lịch sử đặt tour của KH
│   │   ├── AdminTourPage.jsx       # CRUD tour (admin)
│   │   ├── AdminBookingPage.jsx    # Quản lý booking (admin)
│   │   ├── ReportPage.jsx          # Báo cáo doanh thu (dùng View)
│   │   └── ReviewPage.jsx          # Đánh giá tour
│   ├── components/
│   │   ├── TourCard.jsx
│   │   ├── BookingForm.jsx
│   │   ├── SearchBar.jsx
│   │   └── Layout.jsx
│   ├── services/
│   │   └── api.js                  # Axios config + API calls
│   └── App.jsx
├── package.json
└── vite.config.js
```

---

## 1. TV1 — Team Lead + Database Engineer

### Vai trò: Thiết kế DB, viết toàn bộ T-SQL, quản lý Git

### Module cụ thể:

| File | Nội dung | Chi tiết |
|------|----------|----------|
| `database/01_CreateDatabase.sql` | Tạo DB | `CREATE DATABASE TravelTourDB` |
| `database/02_CreateTables.sql` | 10 bảng | Categories, Destinations, Tours, TourSchedules, Customers, Bookings, BookingDetails, Payments, Reviews, Employees |
| `database/03_Views.sql` | 3+ Views | `vw_TourRevenue`, `vw_BookingDetails`, `vw_PopularTours` |
| `database/04_Functions.sql` | 2+ Functions | `fn_CalcBookingTotal`, `fn_CustomerBookingCount` |
| `database/05_StoredProcedures.sql` | 4+ SPs | `sp_CreateBooking`, `sp_CancelBooking`, `sp_SearchTours`, `sp_RevenueReport` |
| `database/06_Triggers.sql` | 2+ Triggers | `trg_AfterBookingInsert`, `trg_AfterBookingCancel` |
| `database/07_SeedData.sql` | Dữ liệu mẫu | 5 categories, 10 destinations, 20 tours, 10 customers, 30 bookings |
| `database/08_Transactions.sql` | Demo Transaction | Booking workflow có BEGIN TRY/CATCH |

### Công việc phụ:
- Setup GitHub repo, branch protection, .gitignore
- Review code của các thành viên khác
- Vẽ ERD (dùng dbdiagram.io)

### Branch: `feature/database-*`

---

## 2. TV2 — Data Access Layer Developer

### Vai trò: Xây dựng toàn bộ tầng truy cập dữ liệu

### Module cụ thể:

| File / Folder | Nội dung |
|---------------|----------|
| **EF Code First** | |
| `DAL/EFCore/Entities/Tour.cs` | Entity class Tour |
| `DAL/EFCore/Entities/Customer.cs` | Entity class Customer |
| `DAL/EFCore/Entities/Booking.cs` | Entity class Booking |
| `DAL/EFCore/Entities/` (7 files nữa) | Tất cả 10 entities |
| `DAL/EFCore/AppDbContext.cs` | DbContext + DbSet + Fluent API config |
| `DAL/EFCore/Configurations/TourConfig.cs` | Entity configuration (relationships, constraints) |
| **EF Database First** | |
| `DAL/EFCore/DatabaseFirst/` | Scaffold từ DB có sẵn (demo mục đích so sánh) |
| **ADO.NET** | |
| `DAL/ADO/AdoTourRepository.cs` | CRUD Tour dùng SqlConnection + SqlCommand |
| `DAL/ADO/AdoBookingRepository.cs` | Gọi Stored Procedure dùng SqlCommand |
| `DAL/ADO/AdoReportRepository.cs` | Query View dùng DataAdapter + DataSet |
| **Repository Pattern** | |
| `DAL/Interfaces/IRepository.cs` | Generic `IRepository<T>` interface |
| `DAL/Interfaces/ITourRepository.cs` | Interface riêng cho Tour |
| `DAL/Interfaces/IBookingRepository.cs` | Interface riêng cho Booking |
| `DAL/Repositories/TourRepository.cs` | Implementation dùng EF |
| `DAL/Repositories/BookingRepository.cs` | Implementation dùng EF |
| `DAL/Repositories/CustomerRepository.cs` | Implementation dùng EF |

### Trọng tâm kỹ thuật:
- **EF Code First**: Migrations, Fluent API, Navigation Properties
- **EF Database First**: `Scaffold-DbContext` command
- **ADO.NET Connected**: `SqlConnection` → `SqlCommand` → `SqlDataReader`
- **ADO.NET Disconnected**: `SqlDataAdapter` → `DataSet` → `DataTable`
- Gọi SP từ EF: `context.Database.ExecuteSqlRaw()` hoặc `FromSqlRaw()`
- Query View từ EF: Map View thành Entity (keyless)

### Branch: `feature/dal-*`

---

## 3. TV3 — Business Logic Layer Developer

### Vai trò: Xử lý nghiệp vụ, validation, LINQ

### Module cụ thể:

| File / Folder | Nội dung |
|---------------|----------|
| **Services** | |
| `BLL/Interfaces/ITourService.cs` | Interface: GetAll, GetById, Search, Create, Update, Delete |
| `BLL/Interfaces/IBookingService.cs` | Interface: CreateBooking, CancelBooking, GetByCustomer |
| `BLL/Interfaces/ICustomerService.cs` | Interface: CRUD + GetBookingHistory |
| `BLL/Interfaces/IReportService.cs` | Interface: GetRevenue, GetPopularTours |
| `BLL/Interfaces/IXmlService.cs` | Interface: ExportToursXml, ImportToursXml |
| `BLL/Services/TourService.cs` | Logic: search/filter tours, kiểm tra tour active |
| `BLL/Services/BookingService.cs` | Logic: validate booking, check slot, calculate price |
| `BLL/Services/CustomerService.cs` | Logic: CRUD customer, validate email/phone |
| `BLL/Services/ReportService.cs` | Logic: aggregate dùng LINQ to Objects |
| `BLL/Services/XmlService.cs` | Logic: LINQ to XML export/import |
| **Validators** | |
| `BLL/Validators/BookingValidator.cs` | Validate: ngày hợp lệ, số người > 0, slot đủ |
| `BLL/Validators/TourValidator.cs` | Validate: giá > 0, tên không trống, duration hợp lý |
| `BLL/Validators/CustomerValidator.cs` | Validate: email format, phone format |
| **LINQ Demos** | |
| `BLL/LinqDemos/LinqToObjectsDemo.cs` | Demo: filter, group, join, aggregate trên collections |
| `BLL/LinqDemos/LinqToXmlDemo.cs` | Demo: tạo XML, query XML, transform XML |

### Trọng tâm kỹ thuật:

**LINQ to Objects** (dùng trong Services):
```csharp
// Ví dụ trong TourService
var popularTours = tours
    .Where(t => t.IsActive)
    .GroupBy(t => t.CategoryId)
    .Select(g => new { Category = g.Key, Count = g.Count(), AvgPrice = g.Average(t => t.Price) })
    .OrderByDescending(x => x.Count);
```

**LINQ to XML** (dùng trong XmlService):
```csharp
// Export
var xml = new XElement("Tours",
    tours.Select(t => new XElement("Tour",
        new XElement("Name", t.TourName),
        new XElement("Price", t.Price))));
xml.Save("tours.xml");

// Import
var doc = XDocument.Load("tours.xml");
var imported = doc.Descendants("Tour")
    .Select(x => new Tour { TourName = x.Element("Name").Value });
```

### Branch: `feature/bll-*`

---

## 4. TV4 — Web API + Frontend Developer

### Vai trò: API Controllers, DTOs, Frontend React

### Module Backend (API):

| File / Folder | Nội dung |
|---------------|----------|
| **DTOs (trong Common project)** | |
| `Common/DTOs/Tour/TourResponse.cs` | Response DTO cho Tour |
| `Common/DTOs/Tour/CreateTourRequest.cs` | Request DTO tạo Tour |
| `Common/DTOs/Tour/UpdateTourRequest.cs` | Request DTO sửa Tour |
| `Common/DTOs/Tour/SearchTourRequest.cs` | Query params tìm tour |
| `Common/DTOs/Booking/BookingResponse.cs` | Response DTO cho Booking |
| `Common/DTOs/Booking/CreateBookingRequest.cs` | Request DTO đặt tour |
| `Common/DTOs/Customer/CustomerResponse.cs` | Response DTO |
| `Common/DTOs/Report/RevenueResponse.cs` | Response báo cáo |
| `Common/DTOs/Xml/XmlExportResponse.cs` | Response export XML |
| **Controllers** | |
| `API/Controllers/ToursController.cs` | CRUD + Search tours |
| `API/Controllers/BookingsController.cs` | Đặt/hủy tour |
| `API/Controllers/CustomersController.cs` | CRUD customers |
| `API/Controllers/ReportsController.cs` | Doanh thu, tour phổ biến |
| `API/Controllers/XmlController.cs` | Export/Import XML |
| `API/Controllers/SchedulesController.cs` | Lịch trình tour |
| `API/Controllers/ReviewsController.cs` | Đánh giá tour |
| **Config** | |
| `API/Program.cs` | DI, CORS, Swagger, EF config |
| `API/Middleware/ExceptionMiddleware.cs` | Global error handling |
| `API/appsettings.json` | Connection string |

### Module Frontend (React):

| File | Nội dung |
|------|----------|
| `frontend/src/pages/TourListPage.jsx` | Danh sách tour + search + filter |
| `frontend/src/pages/TourDetailPage.jsx` | Chi tiết tour, lịch trình, nút đặt |
| `frontend/src/pages/BookingPage.jsx` | Form đặt tour (nhập thông tin hành khách) |
| `frontend/src/pages/AdminTourPage.jsx` | Bảng CRUD tour (admin) |
| `frontend/src/pages/AdminBookingPage.jsx` | Quản lý bookings |
| `frontend/src/pages/ReportPage.jsx` | Biểu đồ doanh thu |
| `frontend/src/components/TourCard.jsx` | Card hiển thị tour |
| `frontend/src/components/BookingForm.jsx` | Form component |
| `frontend/src/components/SearchBar.jsx` | Thanh tìm kiếm |
| `frontend/src/services/api.js` | Axios instance + API functions |

### Branch: `feature/api-*`, `feature/frontend-*`

---

## 5. TV5 — QA + Documentation

### Vai trò: Testing, seed data, báo cáo, README

### Module cụ thể:

| File / Folder | Nội dung |
|---------------|----------|
| **Testing** | |
| `tests/postman/TravelTourBooking.postman_collection.json` | Postman collection toàn bộ API |
| `tests/test-scenarios.md` | Danh sách test case |
| `tests/screenshots/` | Screenshots kết quả test |
| **Seed Data** | |
| `database/07_SeedData.sql` | Dữ liệu mẫu thực tế (hỗ trợ TV1) |
| **Documentation** | |
| `docs/report/main.tex` | File LaTeX chính |
| `docs/report/chapters/ch1-introduction.tex` | Chương 1 |
| `docs/report/chapters/ch2-theory.tex` | Chương 2 (phối hợp cả nhóm) |
| `docs/report/chapters/ch3-analysis.tex` | Chương 3 |
| `docs/report/chapters/ch4-implementation.tex` | Chương 4 (thu thập từ cả nhóm) |
| `docs/report/chapters/ch5-conclusion.tex` | Chương 5 |
| `docs/report/images/` | ERD, screenshots, diagrams |
| `README.md` | Hướng dẫn cài đặt + chạy project |
| **Frontend hỗ trợ** | |
| `frontend/src/pages/BookingHistoryPage.jsx` | Trang lịch sử booking |
| `frontend/src/pages/ReviewPage.jsx` | Trang đánh giá tour |

### Branch: `feature/docs-*`, `feature/test-*`

---

## 6. Ma trận trách nhiệm (RACI)

> **R** = Responsible (thực hiện) | **A** = Accountable (chịu trách nhiệm) | **C** = Consulted | **I** = Informed

| Module | TV1 | TV2 | TV3 | TV4 | TV5 |
|--------|-----|-----|-----|-----|-----|
| Database Schema | **R/A** | C | I | I | I |
| Views, Functions | **R/A** | I | C | I | I |
| Stored Procedures | **R/A** | C | C | I | I |
| Triggers | **R/A** | I | I | I | I |
| Transactions | **R/A** | C | C | I | I |
| EF Code First | C | **R/A** | I | I | I |
| EF Database First | I | **R/A** | I | I | I |
| ADO.NET | I | **R/A** | I | I | I |
| Repository Pattern | I | **R/A** | C | I | I |
| BLL Services | I | C | **R/A** | C | I |
| LINQ to Objects | I | I | **R/A** | I | I |
| LINQ to XML | I | I | **R/A** | I | I |
| Validators | I | I | **R/A** | C | I |
| API Controllers | I | I | C | **R/A** | I |
| DTOs | I | I | C | **R/A** | I |
| Swagger + Middleware | I | I | I | **R/A** | I |
| Frontend React | I | I | I | **R/A** | C |
| Postman Testing | I | I | I | C | **R/A** |
| Báo cáo LaTeX | C | C | C | C | **R/A** |
| README | C | I | I | I | **R/A** |
| Git Management | **R/A** | I | I | I | I |

---

## 7. Quy ước Git

### Branch naming:
```
feature/db-schema          (TV1)
feature/db-views           (TV1)
feature/db-stored-procs    (TV1)
feature/dal-ef-codefirst   (TV2)
feature/dal-ado-net        (TV2)
feature/bll-tour-service   (TV3)
feature/bll-linq-xml       (TV3)
feature/api-controllers    (TV4)
feature/frontend-pages     (TV4)
feature/docs-latex         (TV5)
```

### Commit message:
```
[TV1] feat: add 3 views for revenue and booking reports
[TV2] feat: implement EF Code First with 10 entities
[TV3] feat: add LINQ to XML export/import service
[TV4] feat: create tours and bookings API controllers
[TV5] docs: add chapter 2 - theoretical background
```

---

## 8. Deliverables mỗi tuần

### Tuần 1
| Người | Output cần nộp |
|-------|----------------|
| TV1 | ERD hoàn chỉnh + `01_CreateDatabase.sql` + `02_CreateTables.sql` |
| TV2 | Solution .sln với 4 projects + Entity classes draft |
| TV3 | Danh sách services/interfaces cần xây dựng |
| TV4 | Danh sách API endpoints + DTOs draft |
| TV5 | LaTeX template + Git repo setup |

### Tuần 2
| Người | Output cần nộp |
|-------|----------------|
| TV1 | `03–08` SQL scripts hoàn chỉnh, test trên SSMS |
| TV2 | DbContext + Migrations + ADO repos chạy được |
| TV3 | LINQ to Objects demo queries |
| TV4 | Swagger UI chạy được (stub controllers) |
| TV5 | Seed data + test SQL scripts |

### Tuần 3
| Người | Output cần nộp |
|-------|----------------|
| TV1 | Review SQL, hỗ trợ TV2 gọi SP/View |
| TV2 | DAL hoàn chỉnh, gọi SP + View từ code |
| TV3 | Tất cả Services + Validators + LINQ to XML |
| TV4 | Tất cả Controllers + DTOs + error handling |
| TV5 | Postman collection, bắt đầu test |

### Tuần 4
| Người | Output cần nộp |
|-------|----------------|
| TV1 | Hỗ trợ tích hợp, fix DB issues |
| TV2 | Transaction integration end-to-end |
| TV3 | Integration testing BLL ↔ DAL |
| TV4 | Frontend React 6–8 pages hoàn chỉnh |
| TV5 | Test report + LaTeX Chương 1–3 |

### Tuần 5
| Người | Output cần nộp |
|-------|----------------|
| Cả nhóm | Code review, refactor, LaTeX Chương 4–5, README, chuẩn bị vấn đáp |
