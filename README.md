# ✈️ Travel Tour Booking System

[![.NET](https://img.shields.io/badge/.NET-9.0-blueviolet?style=for-the-badge&logo=dotnet)](https://dotnet.microsoft.com/)
[![Angular](https://img.shields.io/badge/Angular-17%2F18-red?style=for-the-badge&logo=angular)](https://angular.io/)
[![SQL Server](https://img.shields.io/badge/SQL%20Server-2022-red?style=for-the-badge&logo=microsoft-sql-server)](https://www.microsoft.com/en-us/sql-server/)
[![JWT](https://img.shields.io/badge/JWT-Authentication-blue?style=for-the-badge&logo=json-web-tokens)](https://jwt.io/)
[![Architecture](https://img.shields.io/badge/Architecture-3--Layer-green?style=for-the-badge)](#-kiến-trúc-hệ-thống)

Một hệ thống quản lý đặt tour du lịch toàn diện được xây dựng bằng **ASP.NET Core Web API** theo mô hình **3-Layer Architecture** kết hợp với **Angular v17/v18 (Signals & Standalone Components)** và cơ sở dữ liệu **SQL Server**. Dự án triển khai nhiều kỹ thuật như EF (Entities Framework), ADO connected, ADO disconnected, ASP .NET CORE WebAPI,...
---

## 🌟 Các Nhóm Tính Năng Nổi Bật

### 1. 🗂️ Nhóm Quản Lý Tour & Điểm Đến (Catalog)
*   **Xem Danh Sách Tour:** Hỗ trợ phân trang nâng cao (**Pagination**) và bộ lọc thông minh theo danh mục, điểm đến và khoảng giá.
*   **Tìm Kiếm Tour Nâng Cao:** Thực thi tìm kiếm nhanh theo điểm đến, khoảng giá và ngày khởi hành sử dụng Stored Procedure tối ưu `sp_SearchTours`.
*   **Xem Chi Tiết Tour:** Hiển thị thông tin mô tả chi tiết, hình ảnh, lịch khởi hành, danh sách đánh giá và điểm đánh giá trung bình (AvgRating).
*   **Quản Lý Thông Tin Tour (Admin):** Cấp quyền cho Admin thực hiện thêm, sửa, xóa thông tin các tour du lịch.
*   **Quản Lý Loại Hình (Categories):** Thực hiện CRUD danh mục tour phong phú: *Trong nước, Quốc tế, Mạo hiểm, Nghỉ dưỡng...*
*   **Quản Lý Điểm Đến (Destinations):** Thực hiện CRUD chi tiết địa danh gồm tên địa danh, quốc gia và thành phố.
*   **Quản Lý Lịch Khởi Hành (TourSchedules):** Thiết lập lịch khởi hành chi tiết gồm ngày đi, ngày về, tổng số chỗ du lịch và phân công hướng dẫn viên.
*   **Theo Dõi Số Chỗ Còn Trống Real-time:** Tự động cập nhật số chỗ trống còn lại qua hệ thống **Triggers** của Database khi có đơn đặt tour mới hoặc đơn hủy tour.

### 💼 2. Nhóm Nghiệp Vụ Đặt Tour (Booking Workflow)
*   **Quy Trình Đặt Tour Nghiệp Vụ:** Gọi Stored Procedure `sp_CreateBooking` chạy trong giao dịch an toàn (`BEGIN TRANSACTION`): tự động kiểm tra số lượng ghế trống còn lại, tính tổng tiền qua hàm `fn_CalcBookingTotal`, lưu thông tin đặt chỗ cùng danh sách hành khách, và tự động kích hoạt trigger để trừ chỗ.
*   **Nhập Danh Sách Hành Khách:** Ghi nhận thông tin chi tiết từng hành khách đi kèm gồm họ tên, ngày sinh, SĐT, CCCD/Hộ chiếu (thông tin `PassengerIdNumber` bắt buộc đối với người lớn `Adult`, cho phép để trống với trẻ em `Child`) và phân loại nhóm tuổi `PassengerType`.
*   **Áp Dụng Voucher Giảm Giá Động:** Khách hàng có thể nhập mã voucher lấy trực tiếp từ database SQL Server. Hệ thống tự động xác thực tính hợp lệ của mã (ngày hiệu lực, giới hạn tối đa). Đi kèm cơ chế an toàn: tự động hủy chiết khấu cũ khi sửa ô nhập liệu và ghi đè trực tiếp để chống áp dụng chồng/cộng dồn nhiều mã.
*   **Hủy Đặt Tour An Toàn:** Cập nhật trạng thái đơn đặt chỗ `Status = 'Cancelled'` với ràng buộc CHECK constraint nghiêm ngặt của SQL Server (`Pending` → `Confirmed` → `Completed` → `Cancelled`). Tự động kích hoạt trigger hoàn lại số chỗ trống cho lịch trình du lịch.
*   **Xem Chi Tiết Đơn Hàng:** Sử dụng View `vw_BookingDetails` (thực hiện liên kết `JOIN` đa bảng) kèm danh sách chi tiết các hành khách đi cùng.
*   **Lịch Sử Đặt Tour:** Hỗ trợ tra cứu tất cả các đơn đặt tour của khách hàng và lọc nhanh chóng theo trạng thái đơn hàng.

### 🔐 3. Nhóm Quản Lý Khách Hàng & Phản Hồi (User Management & Reviews)
*   **Đăng Ký / Đăng Nhập:** Xác thực bảo mật cao qua **JWT Authentication**. Mật khẩu được mã hóa băm một chiều an toàn bằng **BCrypt** lưu trong bảng `Accounts`. Quyền hạn tài khoản được phân bổ qua bảng `Roles` và `AccountRoles`. Thông tin cá nhân khách hàng được lưu riêng biệt tại bảng `CustomerProfiles`.
*   **Phân Quyền Dựa Trên Vai Trò (RBAC):** Thiết lập 3 cấp độ truy cập rõ ràng, áp dụng bộ lọc `[Authorize(Roles="...")]` trên từng API endpoint:
    *   **Admin:** Toàn quyền hệ thống, CRUD Tour, Categories, Destinations, Employees, Vouchers (mã giảm giá), xem dashboard thống kê doanh thu, và thực hiện Export/Import dữ liệu dạng XML.
    *   **Staff:** Chỉ xem danh sách tour và xem danh sách đơn đặt tour (không có quyền tạo mới, sửa hoặc xóa).
    *   **Customer:** Đăng ký tài khoản, tìm kiếm đặt tour, hủy đơn hàng của chính mình, đánh giá tour và theo dõi lịch sử giao dịch cá nhân.
*   **Quản Lý Voucher (Admin Only):** Màn hình quản trị CRUD danh sách các mã giảm giá vật lý (`Vouchers`) từ database, đi kèm Reactive Form kiểm duyệt dữ liệu nghiêm ngặt, hiển thị thanh tiến độ sử dụng trực quan.
*   **Quản Lý Nhân Sự (Admin Only):** Thực hiện CRUD hồ sơ nhân viên và hướng dẫn viên (bảng `Employees`). *Lưu ý học thuật:* Employees và tài khoản đăng nhập là 2 khái niệm tách biệt hoàn toàn — Employee không đăng nhập vào hệ thống, chỉ được Admin phân công vào trường `TourSchedules.EmployeeId` để phụ trách dẫn tour.
*   **Quản Lý Hồ Sơ Cá Nhân:** Cho phép khách hàng xem và cập nhật thông tin cá nhân của mình.
*   **Đánh Giá & Phản Hồi (Reviews):** Cho phép khách hàng chấm điểm từ 1-5 sao và viết bình luận trải nghiệm (chỉ áp dụng đối với những khách hàng có trạng thái đơn đặt chỗ là `Completed` - đã hoàn thành chuyến đi).
*   **Thống Kê Cá Nhân:** Tự động thống kê tổng số đơn đặt tour thành công trong năm của một tài khoản thông qua hàm vô hướng `fn_UserBookingCount`.

### 💳 4. Nhóm Thanh Toán & Nhân Sự (Payments)
*   **Ghi Nhận Thanh Toán:** Hỗ trợ đặt cọc hoặc thanh toán toàn phần qua nhiều phương thức (VNPay, MoMo, chuyển khoản ngân hàng hoặc tiền mặt). Lưu trữ mã giao dịch `TransactionCode` để phục vụ đối soát tài chính.
*   **Tự Động Sinh Mã Hóa Đơn:** Tự động tạo mã hóa đơn định dạng chuẩn dạng chuỗi `INV-2026-0001` thông qua hàm người dùng tự định nghĩa `fn_GenerateInvoiceCode` và lưu trữ trực tiếp vào cột `InvoiceCode` của bảng `Payments`.
*   **Lịch Sử Thanh Toán Cá Nhân:** Hỗ trợ tính toán tổng số tiền đã trả và số tiền còn nợ của đơn hàng bằng các hàm tính tổng tích lũy LINQ Sum nâng cao.

### 📊 5. Nhóm Báo Cáo & Hệ Thống (Analytics & System)
*   **Thống Kê Doanh Thu Theo Tour:** Truy vấn trực quan từ View vật lý `vw_TourRevenue` để xem tổng doanh thu tích lũy của từng sản phẩm tour.
*   **Xếp Hạng Tour Phổ Biến Nhất:** Thống kê và xếp hạng các tour nổi bật nhất theo điểm đánh giá trung bình và số lượt đặt chỗ từ View `vw_PopularTours`.
*   **Báo Cáo Doanh Thu Theo Năm Tháng:** Thực thi thống kê doanh thu theo thời gian thông qua Stored Procedure `sp_RevenueReport` sử dụng phép gom nhóm dữ liệu `GROUP BY` năm, tháng.
*   **Tỷ Lệ Lấp Đầy Chỗ (Occupancy Rate):** Tính toán chi tiết phần trăm số chỗ đã bán so với tổng số ghế mở bán cho mỗi chuyến đi.
*   **Xuất / Nhập Dữ Liệu Dạng XML:** Cho phép Admin xuất (Export) và nhập (Import) danh sách tour du lịch và các đơn đặt tour thông qua kỹ thuật truy vấn dữ liệu XML nâng cao **LINQ to XML (`XDocument`)**.

---

## 🏗️ Kiến Trúc Hệ Thống

Dự án được thiết kế theo mô hình **3-Layer Architecture** (Kiến trúc 3 tầng) chuẩn doanh nghiệp, kết hợp với frontend **Angular** và cơ sở dữ liệu **SQL Server**:

```text
Travel-Tour-Booking/
├── TravelTourBooking/                      # Mã nguồn Backend & Frontend
│   ├── TravelTourBooking.API/              # 1. PRESENTATION LAYER (Web API)
│   │   ├── Controllers/                    # Điểm tiếp nhận HTTP Requests, điều hướng luồng
│   │   ├── Middleware/                     # ExceptionMiddleware xử lý lỗi và bảo mật toàn cầu
│   │   └── Program.cs                      # Cấu hình Services, DI Container & Middleware Pipeline
│   │
│   ├── TravelTourBooking.BLL/              # 2. BUSINESS LOGIC LAYER (Xử lý Nghiệp vụ)
│   │   ├── Interfaces/                     # Hợp đồng định nghĩa các dịch vụ nghiệp vụ (Services)
│   │   ├── Services/                       # Hiện thực hóa chi tiết logic nghiệp vụ & ràng buộc (Business Rules)
│   │   ├── Validators/                     # Bộ xác thực tính hợp lệ dữ liệu đầu vào (FluentValidation)
│   │   └── Helpers/                        # Công cụ bổ trợ (AutoMapper Profiles, JwtHelper)
│   │
│   ├── TravelTourBooking.DAL/              # 3. DATA ACCESS LAYER (Tương tác Cơ sở dữ liệu)
│   │   ├── ADO/                            # Cài đặt kết nối SqlDataReader & SqlDataAdapter thô
│   │   ├── EFCore/                         # Cấu hình Entity Framework Core DbContext & Entities
│   │   └── Repositories/                   # Bộ đôi Generic Repository & Specific Repositories
│   │
│   ├── TravelTourBooking.Common/           # 4. SHARED LAYER (Thành phần dùng chung)
│   │   ├── DTOs/                           # Cấu trúc trung chuyển dữ liệu (Data Transfer Objects)
│   │   └── Enums/                          # Các kiểu liệt kê định nghĩa trạng thái dùng chung
│   │
│   └── frontend/                           # 5. ANGULAR CLIENT SIDE (Ứng dụng Giao diện)
│       └── src/app/
│           ├── core/                       # Services hệ thống, Guards, HttpInterceptors (JWT)
│           ├── features/                   # Các tính năng chính (Admin, Tours, Bookings, Auth...)
│           └── shared/                     # Components, Models và Pipes dùng chung toàn app
│
├── database/                               # 6. SQL SERVER DATABASE LAYOUT (Kịch bản CSDL)
│   ├── TravelBookingDB.sql                 # Kịch bản chính (Tạo bảng, SPs, Functions, Triggers, Dữ liệu mẫu)
```

---

## ⚡ Kỹ Thuật Lập Trình Cơ Sở Dữ Liệu

Dự án áp dụng hệ thống giải pháp lập trình cơ sở dữ liệu chuyên sâu kết hợp **ASP.NET Core Web API**, **Entity Framework Core 9 (EF Core 9)**, truy vấn **LINQ** và **ADO.NET** để tối ưu hóa hiệu năng và bảo đảm an toàn dữ liệu:

### 1. ⚙️ ASP.NET Core API & Dependency Injection Container (DI)
*   **Scoped DbContext:** Quản lý và tự động giải phóng kết nối `AppDbContext` theo từng HTTP Request, ngăn ngừa rò rỉ kết nối (Connection Leak).
*   **Lifetimes Phân Biệt:** Đăng ký các Repository/Service dưới dạng **Scoped** để giữ nhất quán giao dịch, riêng `AdoTourRepository` dạng **Singleton** để tối ưu cấu hình kết nối.
*   **Global Exception Handling:** Middleware tự động chặn bắt mọi lỗi cơ sở dữ liệu vật lý (khóa ngoại, trigger...), che giấu cấu trúc DB gốc để bảo mật thông tin nhạy cảm và trả về lỗi chuẩn `ApiResponse<T>`.

### 2. 🗄️ Entity Framework Core 9 (ORM)
*   **Keyless Entity Mapping:** Sử dụng `.HasNoKey().ToView(...)` trong Fluent API để ánh xạ trực tiếp các Database Views (`vw_TourRevenue` xem doanh thu, `vw_PopularTours` thống kê độ hot) thành các thực thể chỉ đọc (Read-only) trong C#.
*   **Mẫu Thiết Kế Repository:** Triển khai **Generic & Specific Repository Pattern** giúp tái sử dụng mã nguồn CRUD cơ bản và dễ dàng mở rộng các phương thức truy xuất dữ liệu nâng cao.

### 3. 🔍 Công Nghệ Truy Vấn LINQ (Language Integrated Query)
*   **LINQ to Entities:** Biên dịch Lambda C# thành SQL tối ưu chạy trực tiếp dưới SQL Server:
    *   *Phân trang:* Dùng `.Skip().Take()` giúp chỉ tải các bản ghi của trang hiện tại lên RAM.
    *   *Eager Loading:* Dùng `.Include()` dịch thành phép `LEFT JOIN` tối ưu, loại bỏ triệt để lỗi hiệu năng $N+1$ Query và chống tấn công SQL Injection.
*   **LINQ to Objects & XML:** Ánh xạ dữ liệu sang DTO tự động qua AutoMapper và sử dụng `XDocument` để import/export danh mục Tour bằng XML phân cấp.

### 4. ⚡ EF Core SqlQueryRaw (SQL Thô Cấp Cao)
*   Thực thi trực tiếp các câu truy vấn SQL phức tạp qua hàm `SqlQueryRaw<TResult>(...)`.
*   Tự động ánh xạ kết quả từ DB thành DTO tùy biến một cách an toàn mà không cần khai báo thực thể vật lý trong DbContext, bảo mật tuyệt đối trước SQL Injection.

### 5. 🔌 ADO.NET Connected Model (Kết Nối Liên Tục)
*   **Công cụ:** Sử dụng bộ ba `SqlConnection`, `SqlCommand` (Stored Procedure) và `SqlDataReader`.
*   **Cơ chế:** Duy trì kết nối vật lý liên tục để nạp dữ liệu dạng luồng tuần tự (`SqlDataReader.ReadAsync()`) trực tiếp về RAM.
*   **Ứng dụng:** Áp dụng cho tìm kiếm tour (`sp_SearchTours`) và thống kê doanh thu (`sp_RevenueReport`), tối ưu hiệu năng đọc cực nhanh cho các bảng dữ liệu khổng lồ mà không tốn bộ nhớ RAM để tracking thực thể.

### 6. 💾 ADO.NET Disconnected Model (Kết Nối Không Liên Tục)
*   **Công cụ:** Sử dụng bộ điều phối `SqlDataAdapter`, cấu trúc dữ liệu offline `DataSet` và `DataTable`.
*   **Cơ chế:** Đổ toàn bộ dữ liệu thô vào `DataSet` ngoại tuyến thông qua `adapter.Fill()`, sau đó ngắt kết nối vật lý với DB ngay lập tức để thực hiện liên kết dữ liệu quan hệ (`ds.Relations.Add`) trên bộ nhớ RAM.
*   **Ứng dụng:** Tải đồng thời bảng Tour và Lịch trình đi kèm, thiết lập quan hệ ảo để giảm tải tối đa số lượng kết nối đồng thời lên máy chủ SQL Server.

### 7. ⚡ Cơ Chế An Toàn Giao Dịch & Tự Động Hóa Database (SQL Server Programming)
*   **Concurrency Control (Kiểm soát đồng thời):** Giao dịch an toàn (`BEGIN TRANSACTION` trong `sp_CreateBooking`) kết hợp khóa dòng dữ liệu (`UPDLOCK`, `ROWLOCK`) để loại bỏ hoàn toàn tranh chấp đặt vé đồng thời gây bán quá số chỗ (**Overbooking**).
*   **Database Triggers:** Cập nhật ghế trống real-time và tự động khóa/mở lịch trình khi có sự thay đổi đơn đặt chỗ:
    *   `trg_AfterBookingInsert`: Khấu trừ ghế trống khi đặt tour thành công; tự động đổi trạng thái sang "Full" khi hết chỗ.
    *   `trg_AfterBookingCancel`: Hoàn lại số ghế trống khi hủy đơn; khôi phục trạng thái lịch khởi hành về "Open".
*   **User-Defined Functions:** Hàm vô hướng `fn_CalcBookingTotal` tính tiền tự động sau chiết khấu và hàm `fn_GenerateInvoiceCode` tự động sinh mã hóa đơn dạng `INV-{YEAR}-{ID}`.
*   **Đồng bộ hóa UsedCount của Voucher:** Khi đặt tour thành công qua `CreateBookingAsync`, hệ thống tự động tăng số lượt đã dùng `UsedCount` của mã giảm giá lên 1 đơn vị, được bảo vệ đồng bộ bằng Transaction đồng nhất trong Entity Framework Core nhằm loại bỏ nguy cơ bất đồng bộ dữ liệu.

---

## ⚙️ Hướng Dẫn Cài Đặt & Chạy Dự Án

### 1. Chuẩn bị Cơ sở dữ liệu SQL Server
1. Mở **SQL Server Management Studio (SSMS)** trên máy của bạn.
2. Mở file [database/TravelBookingDB.sql](database/TravelBookingDB.sql) và nhấn **Execute** để tạo cơ sở dữ liệu `TravelBookingDB`, thiết lập các bảng, chỉ mục (Indexes), các hàm (Functions), thủ tục lưu trữ (Stored Procedures), triggers và chèn dữ liệu mẫu hoàn chỉnh.

### 2. Thiết lập và Chạy Backend API
1. Di chuyển vào thư mục dự án API:
   ```bash
   cd TravelTourBooking/TravelTourBooking.API
   ```
2. Mở tệp `appsettings.json` và cấu hình lại chuỗi kết nối SQL Server của bạn tại mục `"DefaultConnection"`.
3. Khởi chạy máy chủ API:
   ```bash
   dotnet run
   ```
4. Truy cập giao diện thử nghiệm Swagger UI tại địa chỉ: `https://localhost:7068/swagger/index.html`

### 3. Thiết lập và Chạy Frontend Angular
1. Mở một cửa sổ Terminal mới và di chuyển vào thư mục mã nguồn giao diện:
   ```bash
   cd TravelTourBooking/frontend
   ```
2. Cài đặt toàn bộ các thư viện phụ thuộc:
   ```bash
   npm install
   ```
3. Chạy ứng dụng client:
   ```bash
   npm start
   ```
4. Truy cập giao diện Web trên trình duyệt tại địa chỉ: `http://localhost:4200/`

---

## 👥 Danh Sách Tài Khoản Thử Nghiệm

Hệ thống được bảo mật và phân quyền chặt chẽ bằng cơ chế **JWT Authentication** phối hợp với các **Route Guards** phía Angular. Bạn có thể sử dụng các tài khoản mẫu sau để thử nghiệm đầy đủ các phân hệ chức năng:

| Vai trò | Email đăng nhập | Mật khẩu mặc định | Quyền hạn thử nghiệm |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@traveltour.com` | `Admin@123` | Toàn quyền hệ thống, xem Dashboard thống kê doanh thu, quản lý danh mục, tour, điểm đến, quản lý nhân viên và xem báo cáo tài chính. |
| **Nhân viên (Staff)** | `staff@travel.com` | `Staff@123` | Quản lý lịch trình tour du lịch, xem danh sách hành khách đi kèm của đơn hàng và hỗ trợ khách hàng đặt/hủy tour. |
| **Khách hàng (Customer)** | `an@gmail.com` | `Customer@123` | Tìm kiếm tour du lịch, tiến hành đặt chỗ điền thông tin hành khách, thanh toán, đánh giá xếp hạng tour và xem lịch sử đặt chỗ. |

