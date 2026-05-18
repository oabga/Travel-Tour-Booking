# ✈️ Travel Tour Booking System

[![.NET](https://img.shields.io/badge/.NET-9.0-blueviolet?style=for-the-badge&logo=dotnet)](https://dotnet.microsoft.com/)
[![Angular](https://img.shields.io/badge/Angular-17%2F18-red?style=for-the-badge&logo=angular)](https://angular.io/)
[![SQL Server](https://img.shields.io/badge/SQL%20Server-2022-red?style=for-the-badge&logo=microsoft-sql-server)](https://www.microsoft.com/en-us/sql-server/)
[![JWT](https://img.shields.io/badge/JWT-Authentication-blue?style=for-the-badge&logo=json-web-tokens)](https://jwt.io/)
[![Architecture](https://img.shields.io/badge/Architecture-3--Layer-green?style=for-the-badge)](#-kiến-trúc-hệ-thống)

Một hệ thống quản lý đặt tour du lịch toàn diện được xây dựng bằng **ASP.NET Core Web API** theo mô hình **3-Layer Architecture** kết hợp với **Angular v17/v18 (Signals & Standalone Components)** và cơ sở dữ liệu **SQL Server**. Dự án triển khai nhiều kỹ thuật nâng cao vượt ngoài khuôn khổ chương trình học cơ bản như tối ưu hóa tranh chấp đồng thời đặt vé (Concurrency Control), tự động cập nhật ghế trống qua Triggers, và xác thực phân quyền dạng RBAC thông qua JWT.

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
*   **Hủy Đặt Tour An Toàn:** Cập nhật trạng thái đơn đặt chỗ `Status = 'Cancelled'` với ràng buộc CHECK constraint nghiêm ngặt của SQL Server (`Pending` → `Confirmed` → `Completed` → `Cancelled`). Tự động kích hoạt trigger hoàn lại số chỗ trống cho lịch trình du lịch.
*   **Xem Chi Tiết Đơn Hàng:** Sử dụng View `vw_BookingDetails` (thực hiện liên kết `JOIN` đa bảng) kèm danh sách chi tiết các hành khách đi cùng.
*   **Lịch Sử Đặt Tour:** Hỗ trợ tra cứu tất cả các đơn đặt tour của khách hàng và lọc nhanh chóng theo trạng thái đơn hàng.

### 🔐 3. Nhóm Quản Lý Khách Hàng & Phản Hồi (User Management & Reviews)
*   **Đăng Ký / Đăng Nhập:** Xác thực bảo mật cao qua **JWT Authentication**. Mật khẩu được mã hóa băm một chiều an toàn bằng **BCrypt** lưu trong bảng `Accounts`. Quyền hạn tài khoản được phân bổ qua bảng `Roles` và `AccountRoles`. Thông tin cá nhân khách hàng được lưu riêng biệt tại bảng `CustomerProfiles`.
*   **Phân Quyền Dựa Trên Vai Trò (RBAC):** Thiết lập 3 cấp độ truy cập rõ ràng, áp dụng bộ lọc `[Authorize(Roles="...")]` trên từng API endpoint:
    *   **Admin:** Toàn quyền hệ thống, CRUD Tour, Categories, Destinations, Employees, xem dashboard thống kê doanh thu, và thực hiện Export/Import dữ liệu dạng XML.
    *   **Staff:** Chỉ xem danh sách tour và xem danh sách đơn đặt tour (không có quyền tạo mới, sửa hoặc xóa).
    *   **Customer:** Đăng ký tài khoản, tìm kiếm đặt tour, hủy đơn hàng của chính mình, đánh giá tour và theo dõi lịch sử giao dịch cá nhân.
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

Dự án được phân chia theo mô hình **3-Layer Architecture** chuẩn doanh nghiệp nhằm tách biệt các trách nhiệm phát triển (Separation of Concerns):

```text
Travel-Tour-Booking/
├── TravelTourBooking/
│   ├── TravelTourBooking.API/      # PRESENTATION LAYER
│   │   ├── Controllers/            # Cung cấp endpoints JSON RESTful cho Client
│   │   └── Middleware/             # ExceptionMiddleware - xử lý lỗi tập trung bảo mật
│   │
│   ├── TravelTourBooking.BLL/      # BUSINESS LOGIC LAYER
│   │   ├── Services/               # Xử lý các quy tắc nghiệp vụ (Business Rules)
│   │   └── Validators/             # Kiểm tra hợp lệ dữ liệu bằng FluentValidation
│   │
│   ├── TravelTourBooking.DAL/      # DATA ACCESS LAYER
│   │   ├── EFCore/                 # Tương tác ORM thông qua DbContext
│   │   └── Repositories/           # Sự kết hợp giữa Generic Repository & Specific Repositories
│   │                               # và các truy vấn tối ưu bằng ADO.NET Connected / Disconnected
│   │
│   └── TravelTourBooking.Common/   # SHARED LAYER
│       └── DTOs/                   # Data Transfer Objects & ApiResponse định dạng chuẩn
│
└── database/                       # DATABASE LAYER (SQL Server Scripts)
```

---

## ⚡ Kỹ Thuật Lập Trình Cơ Sở Dữ Liệu Nâng Cao

Dự án áp dụng một hệ thống giải pháp lập trình cơ sở dữ liệu chuyên sâu, kết hợp sức mạnh của **ASP.NET Core Web API**, **Entity Framework Core (EF Core 8)**, **Ngôn ngữ truy vấn LINQ** và **ADO.NET truyền thống** để tối ưu hóa hiệu năng và bảo đảm an toàn dữ liệu tuyệt đối.

### 1. ⚙️ ASP.NET Core API & Dependency Injection Container (DI)
*   **Quản Lý Vòng Đời Kết Nối Database:** Cấu hình và tiêm `AppDbContext` thông qua container DI tích hợp sẵn trong file `Program.cs` sử dụng vòng đời **Scoped** (`builder.Services.AddDbContext<AppDbContext>(...)`). Điều này đảm bảo mỗi yêu cầu HTTP (HTTP Request) sẽ chỉ sử dụng duy nhất một kết nối DB vật lý và tự động đóng/giải phóng kết nối ngay khi phản hồi (HTTP Response) được hoàn tất, ngăn chặn rò rỉ kết nối (Connection Leak).
*   **Đăng Ký Đa Dạng Lifetimes:**
    *   **Scoped:** Áp dụng cho các Service nghiệp vụ và Repository (`IBookingService`, `IBookingRepository`, `ITourRepository`...) để giữ trạng thái giao dịch nhất quán trong một request.
    *   **Singleton:** Áp dụng cho `AdoTourRepository` giúp duy trì duy nhất một chuỗi cấu hình Connection String trong suốt vòng đời của ứng dụng, giảm thiểu tài nguyên khởi tạo.
*   **Global Exception Handling Middleware:** Hệ thống tích hợp một lớp lọc trung gian `ExceptionMiddleware` bắt toàn bộ lỗi phát sinh từ tầng cơ sở dữ liệu (lỗi khóa ngoại, lỗi trigger, lỗi kết nối DB) và đóng gói thành kết quả đồng nhất `ApiResponse<T>`, giúp che giấu cấu trúc vật lý của CSDL và nâng cao tính bảo mật.

### 2. 🗄️ Entity Framework Core (EF Core 8.0)
*   **DbContext & Fluent API Config:** Định nghĩa ánh xạ các bảng vật lý và thiết lập cấu hình nâng cao trong lớp `AppDbContext`. Sử dụng Fluent API để thiết lập các mối quan hệ 1-N, N-N, và các ràng buộc dữ liệu.
*   **Keyless Entity Mapping (Ánh Xạ Khung Nhìn Views):** Sử dụng cấu hình `.HasNoKey().ToView(...)` trong Fluent API để ánh xạ các View phức tạp trong CSDL thành thực thể thực tế trong C#:
    *   `TourRevenueView` ánh xạ tới View `vw_TourRevenue` (Xem doanh thu lũy kế theo từng tour).
    *   `PopularTourResult` ánh xạ tới View `vw_PopularTours` (Thống kê lượt đặt và đánh giá trung bình).
    Các thực thể keyless này được xử lý như các bảng chỉ đọc (Read-only), tối ưu tốc độ đọc dữ liệu thống kê cho Admin.
*   **Generic & Specific Repository Pattern:**
    *   `GenericRepository<T>`: Đóng gói các phương thức truy cập dữ liệu cơ bản (CRUD) áp dụng chung cho mọi thực thể để tái sử dụng mã nguồn.
    *   `Specific Repositories` (`BookingRepository`, `TourRepository`...): Kế thừa Generic và mở rộng các hàm truy xuất đặc thù, cho phép kết hợp linh hoạt cả LINQ, Raw SQL và ADO.NET kết nối.

### 3. 🔍 Công Nghệ Truy Vấn LINQ (Language Integrated Query)
*   **LINQ to Entities (Truy Vấn Tối Ưu Phía CSDL):** Tác động trực tiếp lên các đối tượng `IQueryable<T>`. EF Core sẽ biên dịch (compile) các biểu thức Lambda C# thành mã lệnh SQL tối ưu để thực thi trực tiếp dưới Server SQL Server:
    *   **Phân trang dữ liệu tại Database:** Sử dụng `.Skip((page-1)*pageSize).Take(pageSize)` giúp SQL Server chỉ tải đúng số bản ghi của trang hiện tại lên bộ nhớ RAM.
    *   **Lọc dữ liệu động:** Kết hợp liên tiếp các hàm `.Where()` dựa trên điều kiện lọc của người dùng trước khi gọi các hàm kích hoạt thực thi (`ToListAsync()`, `FirstOrDefaultAsync()`).
    *   **Eager Loading (Tải kèm dữ liệu liên quan):** Sử dụng các hàm `.Include(t => t.Category).ThenInclude(...)` để dịch thành các câu lệnh `LEFT JOIN` tối ưu phía database, ngăn ngừa triệt để lỗi hiệu năng kinh điển $N+1$ Query.
*   **LINQ to Objects (Xử Lý Bộ Nhớ RAM Máy Chủ BLL):** Sử dụng để ánh xạ (Projection) các thực thể DB sang DTO bằng cách biến đổi cấu trúc danh sách `IEnumerable` trong bộ nhớ RAM máy chủ. Phối hợp nhịp nhàng với các cấu hình ánh xạ tự động trong AutoMapper Profiles (`MappingProfile.cs`).
*   **LINQ to XML (`XDocument`):** Áp dụng kỹ thuật truy vấn và xử lý dữ liệu XML cao cấp trong các tính năng Export/Import danh mục Tour du lịch và đơn đặt chỗ. Cho phép chuyển đổi linh hoạt dữ liệu dạng bảng quan hệ của SQL Server sang định dạng tài liệu XML cây phân cấp và ngược lại một cách nhanh chóng.

### 4. ⚡ EF Core SqlQueryRaw (SQL Thô Cấp Cao)
*   Thực thi trực tiếp các câu lệnh SQL thô thông qua hàm `_db.Database.SqlQueryRaw<TResult>(...)`.
*   Giúp chạy trực tiếp các View phân tích dữ liệu thống kê hoặc gọi thủ tục lưu trữ với các tham số an toàn, tự động ánh xạ (map) kết quả trả về thành mảng DTO tùy biến mà không cần khai báo bảng DB vật lý tương ứng trong DbContext. Bảo vệ hệ thống tuyệt đối khỏi lỗi tấn công chèn mã độc (SQL Injection).

### 5. 🔌 ADO.NET Connected Model (Kết Nối Liên Tục)
*   **Công Cụ:** `SqlConnection`, `SqlCommand` (sử dụng `CommandType.StoredProcedure`), và `SqlDataReader`.
*   **Cơ Chế Hoạt Động:** Duy trì kết nối liên tục từ API Server tới SQL Server trong suốt quá trình đọc dữ liệu. Sử dụng vòng lặp `while (await reader.ReadAsync())` để duyệt và nạp dữ liệu tuần tự dưới dạng luồng (stream) trực tiếp từ database về RAM máy chủ, sau đó chủ động đóng kết nối ngay lập tức.
*   **Ứng Dụng:** Áp dụng cho chức năng tìm kiếm tour gần đúng theo đa tiêu chí (`sp_SearchTours`) và thống kê tài chính (`sp_RevenueReport`). Đây là giải pháp tối ưu hiệu năng đọc cực kỳ vượt trội đối với các bảng dữ liệu khổng lồ vì không phải nạp toàn bộ danh sách đồ sộ vào bộ nhớ RAM của Web API Server cùng lúc như cơ chế tracking của EF Core.

### 6. 💾 ADO.NET Disconnected Model (Kết Nối Không Liên Tục)
*   **Công Cụ:** `SqlDataAdapter`, `DataSet`, `DataTable`, và mối quan hệ ngoại tuyến `DataRelation`.
*   **Cơ Chế Hoạt Động:** Sử dụng bộ điều phối `SqlDataAdapter` như chiếc phà trung chuyển dữ liệu. Thực hiện mở kết nối, truy vấn dữ liệu, nạp đầy cấu trúc cây dữ liệu offline `DataSet` nằm hoàn toàn trên RAM máy chủ thông qua hàm `adapter.Fill(dataSet)`, rồi tự động ngắt kết nối vật lý với Database ngay lập tức.
*   **Ứng Dụng:** Sử dụng trong `AdoTourRepository` để tải đồng thời bảng Danh mục Tour và lịch trình đi kèm, sau đó thiết lập mối quan hệ liên kết ngoại tuyến giữa 2 bảng (`ds.Relations.Add("Tour_Schedules", ...)`) hoàn toàn trên RAM của máy chủ. Kỹ thuật này giúp hệ thống hoạt động cực kỳ nhẹ nhàng, giảm tải trọng kết nối đồng thời lên SQL Server đối với các dữ liệu tĩnh ít biến động.

### 7. ⚡ Cơ Chế An Toàn Giao Dịch & Tự Động Hóa Database (SQL Server Programming)
*   **Concurrency Control (Kiểm Soát Tranh Chấp Đồng Thời):** Trong Stored Procedure `sp_CreateBooking`, hệ thống khởi chạy một giao dịch an toàn (`BEGIN TRANSACTION`). Sử dụng các cơ chế khóa dòng nâng cao (`UPDLOCK`, `ROWLOCK`) để khóa tạm thời dòng dữ liệu của lịch trình đang đặt tour. Đảm bảo tại một thời điểm, chỉ một yêu cầu đặt tour được phép can thiệp trừ ghế trống, ngăn chặn hoàn toàn lỗi bán vượt quá số chỗ (Overbooking).
*   **Database Triggers (Tự Động Hóa Ràng Buộc):**
    *   `trg_AfterBookingInsert`: Tự động trừ số lượng ghế trống (`AvailableSlots`) của lịch trình du lịch ngay khi có đơn đặt tour thành công. Nếu số chỗ trống bằng 0, tự động chuyển trạng thái lịch trình sang "Full".
    *   `trg_AfterBookingCancel`: Tự động cộng trả lại số lượng ghế trống cho lịch trình khi có đơn hàng cập nhật trạng thái sang "Cancelled", chuyển trạng thái lịch trình về "Open" nếu trước đó đang bị khóa đầy chỗ.
*   **User-Defined Functions (Hàm Tự Định Nghĩa):**
    *   **Scalar Function `fn_CalcBookingTotal`:** Tự động tính toán tổng số tiền của đơn hàng dựa trên công thức nghiệp vụ phức tạp: `Giá Tour * Số Người * (1 - Chiết khấu/100)`.
    *   **Scalar Function `fn_GenerateInvoiceCode`:** Tự động sinh mã hóa đơn định dạng chuỗi chuyên nghiệp: `INV-{YEAR_NOW}-{BOOKING_ID}` (ví dụ: `INV-2026-0001`).

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

---

## 📖 Tài Liệu Hướng Dẫn Tự Học & Bảo Vệ Đồ Án Chi Tiết

Nếu bạn đang sử dụng mã nguồn này làm bài tập lớn hoặc đồ án tốt nghiệp, chúng tôi đã biên soạn riêng một bộ tài liệu hướng dẫn học nhanh, giải thích cặn kẽ từng dòng code kèm theo **Bộ câu hỏi FAQ Phản biện đạt điểm A+** tại đây:

👉 **[Tài liệu hướng dẫn học nhanh & bảo vệ đồ án (readme_explanation.md)](readme_explanation.md)** hoặc tại thư mục **[FunctionsAndTasks/readme_explanation.md](FunctionsAndTasks/readme_explanation.md)**

---
*Chúc bạn có những trải nghiệm tuyệt vời và bảo vệ đồ án thành công rực rỡ!*
