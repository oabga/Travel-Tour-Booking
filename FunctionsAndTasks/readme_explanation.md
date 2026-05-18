# HƯỚNG DẪN HỌC NHANH & BÁO CÁO BẢO VỆ ĐỒ ÁN
## HỆ THỐNG ĐẶT TOUR DU LỊCH (TRAVEL TOUR BOOKING SYSTEM)
### Công nghệ áp dụng: ASP.NET Core Web API (3-Layer Architecture) & Angular Frontend & SQL Server

---

## MỤC LỤC

1. [TỔNG QUAN HỆ THỐNG & CẤU TRÚC THƯ MỤC](#1-tổng-quan-hệ-thống--cấu-trúc-thư-mục)
2. [SƠ ĐỒ KIẾN TRÚC & MÔ HÌNH 3-LAYER ARCHITECTURE](#2-sơ-đồ-kiến-trúc--mô-hình-3-layer-architecture)
3. [GIẢI THÍCH CHI TIẾT TỪNG KỸ THUẬT & CODE MINH HỌA THỰC TẾ](#3-giải-thích-chi-tiết-từng-kỹ-thuật--code-minh-họa-thực-tế)
    - [3.1. Presentation Layer (API & UI)](#31-presentation-layer-api--ui)
    - [3.2. Business Logic Layer (BLL)](#32-business-logic-layer-bll)
    - [3.3. Data Access Layer (DAL)](#33-data-access-layer-dal)
    - [3.4. Shared & Cross-cutting (Common)](#34-shared--cross-cutting-common)
4. [LUỒNG HOẠT ĐỘNG TOÀN DIỆN (REQUEST → RESPONSE FLOW)](#4-luồng-hoạt-động-toàn-diện-request--response-flow)
5. [PHÂN TÍCH TOÀN BỘ ĐỐI TƯỢNG CƠ SỞ DỮ LIỆU (DATABASE PROGRAMMING)](#5-phân-tích-toàn-bộ-đối-tượng-cơ-sở-dữ-liệu-database-programming)
6. [CƠ CHẾ AUTHENTICATION & AUTHORIZATION (JWT + RBAC)](#6-cơ-chế-authentication--authorization-jwt--rbac)
7. [FAQ - CÁC CÂU HỎI PHẢN BIỆN BẢO VỆ ĐỒ ÁN (ĐẠT ĐIỂM A+)](#7-faq---các-câu-hỏi-phản-biện-bảo-vỆ-đồ-án-đạt-điểm-a)

---

## 1. TỔNG QUAN HỆ THỐNG & CẤU TRÚC THƯ MỤC

Dự án **Travel-Tour-Booking** là một hệ thống hoàn chỉnh cho phép khách hàng tìm kiếm, đặt tour du lịch và thanh toán; nhân viên quản lý lịch trình, hành khách; quản trị viên giám sát doanh thu và vận hành hệ thống. 

Cấu trúc dự án được phân chia một cách khoa học để giữ cho mã nguồn dễ quản lý, bảo trì và phát triển. Dưới đây là phân tích chi tiết từng thư mục trong dự án của bạn:

```text
Travel-Tour-Booking/
├── TravelTourBooking/                      # Mã nguồn ứng dụng
│   ├── TravelTourBooking.API/              # 1. PRESENTATION LAYER (Web API)
│   │   ├── Controllers/                    # Tiếp nhận HTTP Request từ Client
│   │   ├── Middleware/                     # Bộ lọc trung gian xử lý lỗi & bảo mật
│   │   └── Program.cs                      # File cấu hình khởi chạy hệ thống & Dependency Injection (DI)
│   │
│   ├── TravelTourBooking.BLL/              # 2. BUSINESS LOGIC LAYER (Xử lý Nghiệp vụ)
│   │   ├── Interfaces/                     # Hợp đồng định nghĩa các dịch vụ nghiệp vụ (Services)
│   │   ├── Services/                       # Hiện thực hóa các nghiệp vụ chi tiết
│   │   ├── Validators/                     # Bộ kiểm tra tính hợp lệ dữ liệu (FluentValidation)
│   │   └── Helpers/                        # Các bộ công cụ hỗ trợ (AutoMapper Profiles, JwtHelper)
│   │
│   ├── TravelTourBooking.DAL/              # 3. DATA ACCESS LAYER (Tương tác Cơ sở dữ liệu)
│   │   ├── ADO/                            # Cấu hình kết nối ADO.NET truyền thống
│   │   ├── EFCore/                         # Cấu hình Entity Framework Core (DbContext, Entities, Configurations)
│   │   └── Repositories/                   # Lớp truy vấn dữ liệu chi tiết (Generic & Specific Repositories)
│   │
│   ├── TravelTourBooking.Common/           # 4. SHARED / CROSS-CUTTING LAYER (Sử dụng chung)
│   │   ├── DTOs/                           # Các cấu trúc trung chuyển dữ liệu giữa các Layer
│   │   └── Enums/                          # Các định nghĩa kiểu liệt kê dùng chung toàn hệ thống
│   │
│   └── frontend/                           # 5. ANGULAR CLIENT SIDE UI
│       └── src/
│           └── app/
│               ├── core/                   # Cấu hình lõi (Route Guards, JWT HttpInterceptors, Auth Service)
│               ├── features/               # Các mô-đun chức năng (Admin, Tours, Bookings, Auth, Profile)
│               └── shared/                 # Các component, models và giao diện dùng chung
│
└── database/                               # 6. SQL SERVER DATABASE LAYOUT
    ├── TravelBookingDB.sql                 # Tập lệnh SQL chính (Tạo bảng, Chèn dữ liệu mẫu, Triggers, Views, SPs)
    ├── 03_Views_Booking.sql                # Các khung nhìn phục vụ phân tích dữ liệu đặt tour
    ├── 05_StoredProcedures_Booking.sql     # Các thủ tục lưu trữ xử lý logic đồng thời dữ liệu đặt tour
    └── 06_Triggers_Booking.sql             # Các trình kích hoạt tự động cập nhật số lượng chỗ trống
```

---

## 2. SƠ ĐỒ KIẾN TRÚC & MÔ HÌNH 3-LAYER ARCHITECTURE

Dự án áp dụng mô hình kiến trúc **3-Layer Architecture** (Kiến trúc 3 tầng) chuẩn công nghiệp kết hợp với mẫu thiết kế **Repository Pattern**. Đây là phương pháp giúp tách biệt các trách nhiệm phát triển (**Separation of Concerns - SoC**), đảm bảo hệ thống có tính lỏng lẻo trong liên kết (**Loose Coupling**) và tính đóng gói cao (**High Cohesion**).

### Sơ đồ kiến trúc dòng chảy Dữ liệu & Điều khiển (Request flow)

```mermaid
graph TD
    Client[Angular Frontend] <== HTTP Request / Response ==> API[Presentation Layer - Controllers]
    
    subgraph Backend - 3-Layer Architecture
        API <== DTOs ==> BLL[Business Logic Layer - Services]
        BLL -- Validate ==> FV[FluentValidation]
        BLL <== Domain Entities ==> DAL[Data Access Layer - Repositories]
        
        subgraph Data Access Layer
            DAL -- ORM Queries ==> EF[Entity Framework Core DbContext]
            DAL -- Raw Commands ==> ADO[ADO.NET Connected / Disconnected]
        end
    end
    
    EF <== SQL Queries / Views ==> DB[(SQL Server Database)]
    ADO <== Stored Procedures / Triggers ==> DB
```

---

### 💡 Ẩn dụ thực tế: Mô hình hoạt động của một "Nhà Hàng Cao Cấp"
Để dễ dàng trả lời các câu hỏi phản biện, hãy liên tưởng kiến trúc 3 tầng của hệ thống với cách vận hành của một nhà hàng:
1. **Presentation Layer (Tầng API/UI) ── Người phục vụ bàn:** 
   - Chỉ làm nhiệm vụ tiếp đón khách hàng (Angular), ghi nhận thực đơn yêu cầu từ khách (HTTP Request) và bưng bê món ăn ra phục vụ khách (HTTP Response JSON). Người phục vụ bàn tuyệt đối không được tự ý đi vào bếp nấu ăn hay vào kho lấy thực phẩm.
2. **Business Logic Layer (Tầng Nghiệp vụ BLL) ── Bếp trưởng:** 
   - Trái tim của nhà hàng. Bếp trưởng chịu trách nhiệm kiểm tra tất cả các quy tắc ẩm thực và an toàn thực phẩm (Business Rules). Ví dụ: Khách hàng gọi súp cua thì bếp trưởng phải kiểm tra xem khách hàng có bị dị ứng không (Validate), định lượng gia vị thế nào là vừa phải, có kết hợp sai nguyên liệu kỵ nhau không.
3. **Data Access Layer (Tầng Dữ liệu DAL) ── Thủ kho:** 
   - Lớp duy nhất có chìa khóa kho lạnh (Database). Thủ kho chỉ làm một việc duy nhất: vào kho lạnh lấy đúng nguyên liệu thô (SQL Server) đưa cho đầu bếp, hoặc cất nguyên liệu mới vào kho. Thủ kho hoàn toàn không quan tâm đầu bếp sẽ chế biến nguyên liệu đó thành món ăn gì.

---

### Vai trò chi tiết của từng lớp (Layer) và Lý do thiết kế:

#### 1. Presentation Layer (TravelTourBooking.API)
- **Vai trò:** Là cổng giao tiếp (Gateway) duy nhất giữa thế giới bên ngoài (Angular Client, các hệ thống tích hợp bên thứ ba) với các dịch vụ xử lý nghiệp vụ nội bộ của hệ thống.
- **Trách nhiệm chính:** 
  - Tiếp nhận các HTTP Request (GET, POST, PUT, DELETE), giải mã thông tin đăng nhập và trích xuất danh tính từ token JWT.
  - Áp dụng các chính sách phân quyền truy cập (**Role-Based Access Control - RBAC**).
  - Đóng gói mọi kết quả (thành công hoặc thất bại) thành một định dạng JSON chuẩn chung (`ApiResponse<T>`) trước khi gửi trả về client.
- **Lý do thiết kế:** Giúp tách rời hoàn toàn giao diện người dùng (UI) khỏi logic xử lý nghiệp vụ backend. Giao diện Angular có thể được thay thế, nâng cấp hoặc xây dựng thêm app di động (Flutter/React Native) mà không cần phải chỉnh sửa hay biên dịch lại bất kỳ dòng code xử lý lõi nào ở backend.

#### 2. Business Logic Layer (TravelTourBooking.BLL)
- **Vai trò:** Nơi tập trung toàn bộ các quy tắc nghiệp vụ (**Business Rules**), thuật toán và luồng xử lý chính của doanh nghiệp.
- **Trách nhiệm chính:**
  - Kiểm tra tính đúng đắn và toàn vẹn của dữ liệu đầu vào vượt trên mức định dạng dữ liệu (ví dụ: kiểm tra số lượng chỗ đăng ký của khách có vượt quá số chỗ trống thực tế của chuyến đi hay không).
  - Điều phối các giao dịch nghiệp vụ, gọi các lớp Repository ở tầng DAL để lấy dữ liệu thô, thực hiện tính toán biến đổi, phối hợp nhiều logic nghiệp vụ và trả về kết quả cho tầng Presentation dưới dạng DTO.
- **Lý do thiết kế:** Bảo vệ tính toàn vẹn của hệ thống. Đảm bảo dữ liệu trước khi đi xuống cơ sở dữ liệu phải thỏa mãn tuyệt đối các quy định vận hành thực tế của doanh nghiệp lữ hành.

#### 3. Data Access Layer (TravelTourBooking.DAL)
- **Vai trò:** Lớp duy nhất trong toàn hệ thống được phép kết nối và thực thi các câu lệnh truy vấn trực tiếp với Cơ sở dữ liệu vật lý (SQL Server).
- **Trách nhiệm chính:**
  - Áp dụng mẫu thiết kế **Repository Pattern** nhằm che giấu chi tiết triển khai công nghệ cơ sở dữ liệu.
  - Sử dụng linh hoạt và kết hợp hoàn hảo các công nghệ truy cập dữ liệu khác nhau (Entity Framework Core cho các tác vụ CRUD nhanh chóng, an toàn; ADO.NET Connected và Disconnected Models cho các truy vấn báo cáo và tìm kiếm Real-time hiệu năng cao).
- **Lý do thiết kế:** Tách biệt hoàn toàn công nghệ cơ sở dữ liệu khỏi logic nghiệp vụ. Nếu trong tương lai doanh nghiệp quyết định chuyển đổi hệ quản trị cơ sở dữ liệu từ SQL Server sang Oracle, PostgreSQL hoặc MongoDB, chúng ta chỉ cần viết lại các Repository ở tầng DAL mà hoàn toàn không ảnh hưởng gì tới tầng nghiệp vụ BLL hay tầng API.

#### 4. Shared Layer (TravelTourBooking.Common)
- **Vai trò:** Là lớp cắt ngang (Cross-cutting layer) chứa các cấu trúc dữ liệu dùng chung cho toàn bộ dự án mà không chứa bất kỳ logic nghiệp vụ nào.
- **Trách nhiệm chính:** Chứa các DTOs (Data Transfer Objects), các lớp ApiResponse, các Enum định nghĩa trạng thái booking, trạng thái thanh toán và các Helper dùng chung.
- **Lý do thiết kế:** Giúp tránh hiện tượng phụ thuộc vòng tròn (Circular Dependency) giữa các Layer và định kiểu dữ liệu đồng bộ trên toàn bộ hệ thống.

---

## 3. GIẢI THÍCH CHI TIẾT TỪNG KỸ THUẬT & CODE MINH HỌA THỰC TẾ

Đây là phần quan trọng nhất giúp bạn hiểu rõ bản chất từng thuật ngữ kỹ thuật, mục đích sử dụng và các file thực tế đang áp dụng trong dự án.

---

### 3.1. Presentation Layer (API & UI)

#### 1. ASP.NET Core Web API
- **Khái niệm**: Là một nền tảng (framework) dùng để xây dựng các dịch vụ HTTP (RESTful APIs) giúp các hệ thống khác nhau (như Web Angular, ứng dụng Mobile, v.v.) có thể kết nối và trao đổi dữ liệu.
- **Mục đích**: Cung cấp các điểm đầu cuối dữ liệu (endpoints) định dạng JSON để client gọi và trao đổi thông tin.
- **Cách hoạt động**: Khi Angular gửi yêu cầu HTTP (ví dụ: `GET /api/tours`), Router của API sẽ định tuyến yêu cầu đó đến đúng Controller và Action xử lý tương ứng, sau đó gửi trả kết quả dạng JSON.
- **Vì sao hệ thống dùng**: Giúp tách rời hoàn toàn Frontend và Backend. Backend chỉ tập trung xử lý logic và cung cấp dữ liệu, giúp dễ dàng nâng cấp hoặc thay thế Frontend mà không ảnh hưởng hệ thống cốt lõi.
- **File đang áp dụng**: Mọi file trong thư mục [Controllers](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/TravelTourBooking/TravelTourBooking.API/Controllers).
- **Ví dụ thực tế**:
  [BookingsController.cs](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/TravelTourBooking/TravelTourBooking.API/Controllers/BookingsController.cs) dòng 11:
  ```csharp
  [ApiController]
  [Route("api/bookings")]
  public class BookingsController(IBookingService svc) : ControllerBase
  {
      [HttpGet("{id:int}")]
      public async Task<IActionResult> GetById(int id)
      {
          var detail = await svc.GetBookingDetailAsync(id);
          if (detail is null) return NotFound(ApiResponse<string>.Fail("Không tìm thấy"));
          return Ok(ApiResponse<BookingDetailViewDto>.Ok(detail));
      }
  }
  ```

#### 2. JWT Authentication (JSON Web Token)
- **Khái niệm**: Là phương thức xác thực người dùng không lưu trạng thái trên máy chủ (**Stateless Session Management**). Thay vì lưu trạng thái đăng nhập của khách hàng trong bộ nhớ RAM của server (Session), server sẽ cấp cho client một chuỗi mã hóa ký số dạng token sau khi đăng nhập thành công.
- **💡 Ẩn dụ thực tế ── Thẻ lên máy bay (Boarding Pass) hoặc Vé trọn gói khu vui chơi:**
  - Khi bạn đăng nhập thành công, máy chủ cấp cho bạn một tấm vé đóng dấu mộc đỏ (chữ ký số ký bằng khóa bí mật `SecretKey` trên Server).
  - Trên tấm vé này ghi đầy đủ thông tin của bạn (Claims) như: ID tài khoản, Email, và các Quyền hạn của bạn (Roles).
  - Mỗi lần bạn đi chơi một trò chơi hay vào phòng VIP (gọi API yêu cầu đăng nhập), bạn chỉ việc trình tấm vé này ra. Người soát vé (Server Middleware) chỉ việc dùng chìa khóa để giải mã kiểm tra xem mộc dấu đỏ có phải do trung tâm đóng không. Nếu đúng dấu mộc đỏ, họ lập tức cho bạn vào cổng mà **không cần phải gọi điện thoại hay tra cứu CSDL để kiểm tra xem bạn là ai nữa** (Stateless).
- **Mục đích**: Nhận diện danh tính người dùng mà không cần tiêu tốn tài nguyên bộ nhớ RAM lưu trữ Session trên server, tăng cực mạnh khả năng mở rộng hệ thống (Scalability).
- **Cách hoạt động**:
  1. Client gửi email và mật khẩu lên API `/api/auth/login`.
  2. Server kiểm tra DB, tạo ra chuỗi JWT gồm 3 phần ngăn cách bởi dấu chấm `Header.Payload.Signature` chứa các thông tin tài khoản (Claims: ID, Email, Quyền hạn) ký bằng khóa bí mật (`SecretKey`) dùng thuật toán mã hóa `HmacSha256`.
  3. Client nhận token và lưu vào `localStorage`. Mỗi request tiếp theo gửi lên, Client đính token này vào HTTP Header: `Authorization: Bearer <Token>`.
  4. Server giải mã token bằng khóa bí mật để xác định người dùng đó là ai.
- **Vì sao hệ thống dùng**: Hạn chế việc truy vấn liên tục vào DB để kiểm tra session và tăng tính bảo mật do token được ký số không thể giả mạo.
- **File đang áp dụng**:
  - Máy chủ (Backend): [JwtHelper.cs](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/TravelTourBooking/TravelTourBooking.BLL/Helpers/JwtHelper.cs) để tạo token; [Program.cs](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/TravelTourBooking/TravelTourBooking.API/Program.cs#L64-L79) để cấu hình xác minh token.
  - Máy khách (Frontend Angular): [auth.service.ts](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/TravelTourBooking/frontend/src/app/core/services/auth.service.ts) để giải mã client-side; [jwt.interceptor.ts](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/TravelTourBooking/frontend/src/app/core/interceptors/jwt.interceptor.ts) để tự động đính kèm token vào Header request.
- **Ví dụ thực tế**:
  Trong [JwtHelper.cs](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/TravelTourBooking/TravelTourBooking.BLL/Helpers/JwtHelper.cs#L19-L52) tạo token:
  ```csharp
  var claims = new List<Claim> {
      new Claim(ClaimTypes.NameIdentifier, account.AccountId.ToString()),
      new Claim(ClaimTypes.Email, account.Email)
  };
  foreach (var role in roles) claims.Add(new Claim(ClaimTypes.Role, role));
  var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JwtSettings:SecretKey"]));
  var token = new JwtSecurityToken(
      issuer: _configuration["JwtSettings:Issuer"],
      audience: _configuration["JwtSettings:Audience"],
      claims: claims,
      expires: DateTime.Now.AddMinutes(30),
      signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
  );
  return new JwtSecurityTokenHandler().WriteToken(token);
  ```

#### 3. RBAC (Role-Based Access Control - Phân quyền theo vai trò)
- **Khái niệm**: Là cơ chế phân quyền truy cập tài nguyên dựa trên chức vụ hay vai trò (Role) được định nghĩa sẵn của người dùng trong hệ thống.
- **Mục đích**: Bảo vệ các dữ liệu nhạy cảm và các API nghiệp vụ quan trọng khỏi sự truy cập trái phép. Đảm bảo đúng người đúng việc.
- **Cách hoạt động**: 
  - Khi đính thuộc tính `[Authorize(Roles = "Admin,Staff")]` trước các Action hoặc Controller, ASP.NET Core Middleware tự động chặn đứng và kiểm tra vai trò người dùng trong `ClaimTypes.Role` của Token. 
  - Nếu không thỏa mãn, hệ thống trả về HTTP Status Code **403 Forbidden** (Có danh tính nhưng không đủ thẩm quyền) hoặc **401 Unauthorized** (Không có danh tính/chưa đăng nhập).
- **Vì sao hệ thống dùng**: Hệ thống phân quyền rất rõ rệt cho 3 nhóm người dùng: **Admin** (toàn quyền quản trị), **Staff** (chỉ có quyền xem danh sách, cập nhật lịch trình, quản lý đặt tour), và **Customer** (chỉ có quyền xem thông tin tour, đặt tour cá nhân và thanh toán).
[HttpGet("all")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GetAllBookings() { ... }
    ```

#### 4. Exception Middleware (Bộ xử lý lỗi tập trung toàn cầu)
- **Khái niệm**: Là một khối mã trung gian (Middleware) nằm trong chu trình xử lý request (HTTP Pipeline) của ASP.NET Core để bắt tất cả các ngoại lệ (Exception) xảy ra ở bất kỳ tầng nào (DAL, BLL, Controller) trong hệ thống.
- **Mục đích**: 
  - **Đảm bảo tính ổn định cao:** Hệ thống không bao giờ bị sập (Crash) đột ngột hoặc trả về trang lỗi HTML mặc định xấu xí của IIS/Kestrel.
  - **Đồng bộ hóa định dạng:** Trả về định dạng lỗi JSON thống nhất (`ApiResponse.Fail(...)`), giúp lập trình viên Angular dễ dàng viết code xử lý lỗi tập trung ở client.
  - **Bảo mật tuyệt đối thông tin hệ thống:** Che giấu chi tiết lỗi gốc nhạy cảm (như lỗi kết nối database, tên cột, tên bảng, lỗi cú pháp SQL) khỏi người dùng đầu cuối để ngăn chặn tin tặc thu thập thông tin tấn công hệ thống.
- **Cách hoạt động**: Khi bất kỳ dòng code nào ở DAL, BLL hay Controller ném ra lỗi (`throw ex`), Middleware sẽ bắt lấy lỗi đó (`catch`), phân loại loại lỗi (ví dụ: `ArgumentException` -> HTTP 400, `KeyNotFoundException` -> HTTP 404, `InvalidOperationException` -> HTTP 409), ghi nhật ký hệ thống (log) cho dev đọc, và đóng gói lỗi thành đối tượng `ApiResponse.Fail(lỗi)` rồi ghi đè vào luồng HTTP Response.
- **Vì sao hệ thống dùng**: Áp dụng nguyên tắc DRY (Don't Repeat Yourself), giúp các lập trình viên không cần viết các khối lệnh `try - catch` lặp đi lặp lại ở từng Controller, làm code sạch và dễ đọc hơn rất nhiều.
- **File đang áp dụng**: [ExceptionMiddleware.cs](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/TravelTourBooking/TravelTourBooking.API/Middleware/ExceptionMiddleware.cs).
- **Ví dụ thực tế**:
  Trong [ExceptionMiddleware.cs](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/TravelTourBooking/TravelTourBooking.API/Middleware/ExceptionMiddleware.cs#L26-L43):
  ```csharp
  ctx.Response.StatusCode = ex switch
  {
      KeyNotFoundException => (int)HttpStatusCode.NotFound,       // 404 Not Found
      UnauthorizedAccessException => (int)HttpStatusCode.Forbidden, // 403 Forbidden
      InvalidOperationException => (int)HttpStatusCode.Conflict,  // 409 Conflict
      ArgumentException => (int)HttpStatusCode.BadRequest,        // 400 Bad Request
      _ => (int)HttpStatusCode.InternalServerError                 // 500 Server Error
  };
  var body = JsonSerializer.Serialize(ApiResponse<string>.Fail(ex.Message));
  await ctx.Response.WriteAsync(body);
  ```

#### 5. Swagger (OpenAPI)
- **Khái niệm**: Là bộ công cụ tự động quét mã nguồn và sinh ra tài liệu giao diện web trực quan để kiểm thử và tương tác với Web API.
- **Mục đích**: Giúp lập trình viên Frontend hoặc bên thứ ba hiểu rõ các API hiện có gồm những gì, tham số truyền vào ra sao và có thể chạy thử trực tiếp mà không cần dùng Postman.
- **File đang áp dụng**: Cấu hình trong [Program.cs](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/TravelTourBooking/TravelTourBooking.API/Program.cs#L93-L139).

---

### 3.2. Business Logic Layer (BLL)

#### 1. Interface + Service Pattern (Mẫu thiết kế Giao diện & Lớp dịch vụ)
- **Khái niệm**: 
  - **Interface**: Là một bản thiết kế hoặc hợp đồng định nghĩa các chữ ký phương thức (tên hàm, tham số đầu vào, kiểu dữ liệu trả về) mà không hề chứa bất kỳ mã thực thi nào.
  - **Service**: Là lớp trực tiếp thực thi (implement) hợp đồng được cam kết trong Interface để giải quyết nghiệp vụ chi tiết.
- **Mục đích**: 
  - Đảm bảo tính liên kết lỏng lẻo (**Loose Coupling**).
  - Hiện thực hóa nguyên lý thứ 5 trong SOLID ── **Dependency Inversion Principle (DIP)**: *"Các thành phần hệ thống nên phụ thuộc vào sự trừu tượng (Abstraction/Interface), không nên phụ thuộc vào sự cụ thể (Concrete Class)"*.
  - Giúp viết Unit Test cực kỳ dễ dàng bằng cách tạo ra các đối tượng giả lập (Mocking Objects) thay vì phải chạy cơ sở dữ liệu thật trong quá trình kiểm thử.
- **File đang áp dụng**: Thư mục [Interfaces](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/TravelTourBooking/TravelTourBooking.BLL/Interfaces) và [Services](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/TravelTourBooking/TravelTourBooking.BLL/Services).
- **Ví dụ thực tế**:
  Interface `ITourService` định nghĩa:
  ```csharp
  public interface ITourService {
      Task<TourDetailDto?> GetTourByIdAsync(int id);
  }
  ```
  Lớp triển khai `TourService` viết code chi tiết nghiệp vụ:
  ```csharp
  public class TourService(ITourRepository tourRepo, IMapper mapper) : ITourService {
      public async Task<TourDetailDto?> GetTourByIdAsync(int id) {
          var tour = await tourRepo.GetDetailAsync(id);
          return mapper.Map<TourDetailDto>(tour);
      }
  }
  ```

#### 2. Business Rules (Ràng buộc nghiệp vụ)
- **Khái niệm**: Là các quy định logic ràng buộc các hoạt động nghiệp vụ của thế giới thực tế kinh doanh vào phần mềm.
- **Mục đích**: Ngăn ngừa hoàn toàn dữ liệu không hợp lý/mâu thuẫn đi xuống cơ sở dữ liệu làm phá vỡ tính nhất quán và toàn vẹn của hệ thống.
- **File đang áp dụng**: [BookingService.cs](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/TravelTourBooking/TravelTourBooking.BLL/Services/BookingService.cs).
- **Ví dụ thực tế**:
  Trong `BookingService`:
  ```csharp
  // Nghiệp vụ 1: Số khách hàng khai báo điền thông tin phải bằng với số lượng đăng ký đặt chỗ
  if (dto.Passengers.Count != dto.NumberOfPeople)
      throw new ArgumentException("Số lượng hành khách không khớp với số lượng đăng ký đặt tour.");

  // Nghiệp vụ 2: Chỉ được chọn duy nhất 1 hành khách làm liên hệ chính
  var primaryContacts = dto.Passengers.Where(p => p.IsPrimaryContact).ToList();
  if (primaryContacts.Count == 0)
      throw new ArgumentException("Phải chọn ít nhất 1 hành khách làm liên hệ chính.");
  if (primaryContacts.Count > 1)
      throw new ArgumentException("Chỉ được phép chọn duy nhất 1 hành khách làm liên hệ chính.");

  // Nghiệp vụ 3: Người liên hệ chính bắt buộc phải là Người lớn (Adult) và phải cung cấp Số điện thoại
  var primary = primaryContacts[0];
  if (primary.PassengerType != "Adult")
      throw new ArgumentException("Người liên hệ chính bắt buộc phải là người lớn (Adult).");
  if (string.IsNullOrWhiteSpace(primary.PassengerPhone))
      throw new ArgumentException("Người liên hệ chính bắt buộc phải nhập Số điện thoại liên lạc.");

  // Nghiệp vụ 4: Khách hàng là người lớn (Adult) bắt buộc phải có thông tin CCCD hoặc Hộ Chiếu
  var adultsWithoutId = dto.Passengers
      .Where(p => p.PassengerType == "Adult" && string.IsNullOrWhiteSpace(p.PassengerIdNumber)).ToList();
  if (adultsWithoutId.Any())
      throw new ArgumentException("Hành khách người lớn bắt buộc phải có Số CCCD/Hộ chiếu.");

  // Nghiệp vụ 5: Đoàn đi tour bắt buộc phải có ít nhất một người lớn đi kèm (Chặn trẻ em đi tour một mình)
  var hasAdult = dto.Passengers.Any(p => p.PassengerType == "Adult");
  if (!hasAdult)
      throw new ArgumentException("Đoàn hành khách đặt tour bắt buộc phải có ít nhất một người lớn (Adult) đi kèm.");

  // Nghiệp vụ 6: Bắt buộc nhập Ngày sinh và kiểm tra khớp độ tuổi (mốc 12 tuổi) du lịch
  var today = DateOnly.FromDateTime(DateTime.Today);
  foreach (var p in dto.Passengers)
  {
      if (p.PassengerDOB == null)
          throw new ArgumentException($"Hành khách '{p.PassengerName}' bắt buộc phải nhập Ngày sinh.");

      var dob = p.PassengerDOB.Value;
      if (dob > today)
          throw new ArgumentException($"Ngày sinh của hành khách '{p.PassengerName}' không được nằm ở tương lai.");

      int age = today.Year - dob.Year;
      if (dob > today.AddYears(-age)) age--;

      if (p.PassengerType == "Child" && age >= 12)
          throw new ArgumentException($"Hành khách '{p.PassengerName}' được chọn là Trẻ em nhưng đã {age} tuổi (phải dưới 12).");
      if (p.PassengerType == "Adult" && age < 12)
          throw new ArgumentException($"Hành khách '{p.PassengerName}' được chọn là Người lớn nhưng mới {age} tuổi (phải từ 12).");
  }
  ```

#### 3. LINQ to Objects
- **Khái niệm**: Là ngôn ngữ truy vấn tích hợp trong C# dùng để thực hiện các thao tác tìm kiếm, sắp xếp, biến đổi cấu trúc dữ liệu trên các mảng, danh sách (`IEnumerable`, `List`) đang nằm trong bộ nhớ RAM.
- **Mục đích**: Xử lý, tính toán hoặc định dạng dữ liệu linh hoạt sau khi dữ liệu đã được tải từ Database lên.

#### 4. FluentValidation
- **Khái niệm**: Là thư viện bên thứ ba mạnh mẽ giúp viết các quy tắc kiểm tra tính hợp lệ của dữ liệu đầu vào (Input Validation) bằng cách sử dụng cú pháp dạng Lambda (Fluent Interface).
- **Mục đích**: Tách biệt logic kiểm tra tính đúng đắn của dữ liệu ra khỏi tầng nghiệp vụ và Controller, giúp mã nguồn sạch hơn so với cách dùng các thuộc tính DataAnnotations như `[Required]`, `[StringLength]` lỗi thời.
- **Cách hoạt động**: Khi một DTO được gửi tới API Controller, thư viện tự động chặn và chạy qua Validator tương ứng. Nếu vi phạm bất cứ ràng buộc nào, API lập tức dừng lại và trả về lỗi HTTP 400 kèm thông báo tương ứng.
- **File đang áp dụng**: Thư mục [Validators](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/TravelTourBooking/TravelTourBooking.BLL/Validators).

---

### 3.3. Data Access Layer (DAL)

#### 1. Entity Framework Core DbContext (Trình ánh xạ đối tượng ORM)
- **Khái niệm**: Là một thư viện ORM (Object-Relational Mapper) hiện đại của Microsoft, ánh xạ các bảng vật lý trong cơ sở dữ liệu quan hệ (SQL Server) thành các đối tượng class C# tương ứng để thực hiện các thao tác CRUD dữ liệu thông qua ngôn ngữ hướng đối tượng mà không cần viết lệnh SQL thủ công.
- **Vai trò lý thuyết cốt lõi**: Đóng vai trò là cầu nối phiên dịch ngữ nghĩa giữa thế giới Lập trình hướng đối tượng (C# - các Class, Object) và thế giới Cơ sở dữ liệu quan hệ (SQL Server - các Table, Column).
- **Cơ chế hoạt động chính**: 
  - Lớp `DbContext` đại diện cho một phiên làm việc với database. Các thuộc tính `DbSet<T>` đóng vai trò là các bảng vật lý.
  - **Change Tracking (Bộ theo dõi thay đổi):** Khi EF Core tải dữ liệu lên RAM, nó tạo một bản sao ẩn của thực thể đó. Khi ta sửa đổi thuộc tính của thực thể trong RAM và gọi `SaveChanges()`, EF Core tự động so sánh đối tượng hiện tại với bản sao ẩn để sinh ra đúng câu lệnh `UPDATE` cho những cột bị thay đổi giá trị, tối ưu hóa tối đa hiệu năng.
- **File đang áp dụng**: [AppDbContext.cs](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/TravelTourBooking/TravelTourBooking.DAL/EFCore/AppDbContext.cs).
- **Ví dụ thực tế**:
  Đăng ký các bảng và liên kết khung nhìn (View) trong `AppDbContext`:
  ```csharp
  public class AppDbContext : DbContext
  {
      public DbSet<Category> Categories => Set<Category>();
      public DbSet<Tour> Tours => Set<Tour>();
      
      // Ánh xạ View của cơ sở dữ liệu thành đối tượng C# không có khóa chính
      public DbSet<TourRevenueView> TourRevenueView { get; set; }

      protected override void OnModelCreating(ModelBuilder modelBuilder) {
          modelBuilder.Entity<TourRevenueView>().HasNoKey().ToView("vw_TourRevenue");
      }
  }
  ```

#### 2. LINQ to Entities (Ngôn ngữ truy vấn tích hợp trên Cơ sở dữ liệu)
- **Khái niệm**: Là các truy vấn LINQ viết bằng mã C# tác động lên các thuộc tính có kiểu dữ liệu là `IQueryable<T>` của EF Core.
- **Đặc trưng lý thuyết cốt lõi ── Trì hoãn thực thi (Deferred Execution):**
  - Khi ta viết câu truy vấn LINQ to Entities, câu lệnh **chưa hề chạy** dưới Database. Nó được lưu trữ dưới dạng một **Cây biểu thức (Expression Tree)**.
  - Chỉ đến khi ta gọi các hàm truy xuất như `.ToListAsync()`, `.FirstOrDefaultAsync()`, `.CountAsync()`, EF Core mới chính thức bắt đầu biên dịch cây biểu thức đó thành một câu lệnh SQL hoàn chỉnh (`SELECT ... WHERE...`), gửi xuống SQL Server thực thi, nhận dữ liệu đổ về RAM và gán tự động vào các đối tượng C#.
- **Vì sao hệ thống dùng**: 
  - Giúp tránh viết các câu lệnh SQL thô lồng trong code C# dễ dẫn đến sai cú pháp và khó bảo trì.
  - **Bảo mật tuyệt đối:** EF Core tự động tham số hóa (parameterize) tất cả các biến đầu vào, ngăn chặn triệt để các lỗ hổng tấn công chèn mã độc phá hoại cơ sở dữ liệu (**SQL Injection**).
- **File đang áp dụng**: [TourRepository.cs](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/TravelTourBooking/TravelTourBooking.DAL/Repositories/TourRepository.cs), [BookingRepository.cs](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/TravelTourBooking/TravelTourBooking.DAL/Repositories/BookingRepository.cs).
- **Ví dụ thực tế**:
  Phân trang nâng cao kết hợp lọc điều kiện tại database:
  ```csharp
  var query = _db.Tours.Include(t => t.Category).Where(t => t.IsActive);
  
  if (cateId.HasValue) query = query.Where(t => t.CateId == cateId.Value);
  if (priceMin.HasValue) query = query.Where(t => t.Price >= priceMin.Value);

  var items = await query
      .Skip((page - 1) * pageSize) // Bỏ qua các phần tử trang trước (Phân trang DB)
      .Take(pageSize)              // Lấy số lượng phần tử trang hiện tại
      .ToListAsync();              // Lúc này EF mới dịch sang SQL và chạy trên Database
  ```

#### 3. Generic Repository & Specific Repository Pattern (Mẫu thiết kế kho lưu trữ)
- **Khái niệm**:
  - **Generic Repository (Kho lưu trữ tổng quát)**: Lớp thiết kế tổng quát định nghĩa và cài đặt sẵn các phương thức CRUD cơ bản nhất áp dụng chung cho tất cả các bảng dữ liệu trong hệ thống (`GetAll`, `GetById`, `Add`, `Update`, `Delete`).
  - **Specific Repository (Kho lưu trữ đặc thù)**: Lớp kế thừa lại toàn bộ các phương thức của Generic Repository và mở rộng thêm các hàm truy vấn nâng cao, các phép kết bảng (JOIN) đặc thù mà chỉ thực thể đó mới có nhu cầu sử dụng.
- **Mục đích & Lợi ích thiết kế:**
  - **Nguyên lý DRY (Don't Repeat Yourself):** Tránh lặp đi lặp lại hàng trăm dòng code CRUD cơ bản giống hệt nhau cho từng thực thể khác nhau trong dự án.
  - **Dễ bảo trì:** Nếu logic thêm/sửa/xóa cơ bản thay đổi, ta chỉ cần sửa đúng 1 file duy nhất là `GenericRepository.cs` thay vì sửa hàng chục file repository khác nhau.
  - **Tách biệt dữ liệu:** Đảm bảo tầng dịch vụ nghiệp vụ (BLL) không cần biết EF Core đang lấy dữ liệu thế nào, làm mã nguồn vô cùng sạch sẽ và chuyên nghiệp.
- **File đang áp dụng**: 
  - Tổng quát: [IRepository.cs](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/TravelTourBooking/TravelTourBooking.DAL/Repositories/Interfaces/IRepository.cs), [GenericRepository.cs](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/TravelTourBooking/TravelTourBooking.DAL/Repositories/GenericRepository.cs).
  - Đặc thù: [ITourRepository.cs](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/TravelTourBooking/TravelTourBooking.DAL/Repositories/Interfaces/ITourRepository.cs), [TourRepository.cs](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/TravelTourBooking/TravelTourBooking.DAL/Repositories/TourRepository.cs).
- **Ví dụ thực tế**:
  ```csharp
  // Kế thừa các hàm cơ bản của GenericRepository<Tour> và mở rộng thêm các hàm của ITourRepository
  public class TourRepository : GenericRepository<Tour>, ITourRepository
  {
      public TourRepository(AppDbContext db) : base(db) { }

      // Hàm mở rộng đặc thù của riêng Tour
      public async Task<Tour?> GetDetailAsync(int tourId) {
          return await _db.Tours.Include(t => t.Category).FirstOrDefaultAsync(t => t.TourId == tourId);
      }
  }
  ```

#### 4. EF Core SqlQueryRaw (Truy vấn SQL thô cấp cao)
- **Khái niệm**: Là kỹ thuật cho phép chạy các câu lệnh SQL thuần (Raw SQL) hoặc gọi View vật lý từ database trực tiếp qua EF Core nhưng kết quả trả về sẽ được tự động ánh xạ (map) vào các lớp DTO tự định nghĩa.
- **Mục đích**: Giải quyết các câu truy vấn phức tạp kết hợp thống kê đa bảng mà viết bằng LINQ C# sẽ rất khó khăn hoặc hiệu năng kém.
- **File đang áp dụng**: [TourRepository.cs](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/TravelTourBooking/TravelTourBooking.DAL/Repositories/TourRepository.cs) dòng 111-117.
- **Ví dụ thực tế**:
  ```csharp
  public async Task<IEnumerable<PopularTourResult>> GetPopularAsync()
  {
      // Thực thi truy vấn SQL thô từ DbContext và map trực tiếp kết quả vào PopularTourResult DTO
      var rows = await _db.Database
          .SqlQueryRaw<PopularTourResult>("SELECT * FROM vw_PopularTours ORDER BY TotalBookings DESC, AvgRating DESC")
          .ToListAsync();
      return rows;
  }
  ```

#### 5. ADO.NET Connected Model (Mô hình kết nối liên tục - SqlDataReader)
- **Khái niệm**: Là mô hình lập trình cơ sở dữ liệu truyền thống, yêu cầu duy trì kết nối vật lý liên tục và ổn định từ ứng dụng tới cơ sở dữ liệu SQL Server trong suốt quá trình đọc dữ liệu.
- **💡 Ẩn dụ thực tế ── Vòi nước đang mở chảy liên tục:**
  - Bạn cắm trực tiếp đường ống vào nguồn nước (Open Connection).
  - Dữ liệu chảy trực tiếp từ database về RAM của server theo từng dòng tuần tự (stream) thông qua hàm `SqlDataReader`.
  - Bạn phải liên tục giữ đường ống mở. Đọc đến đâu xử lý đến đó, sau khi xong bắt buộc phải khóa vòi nước ngay lập tức (`Close Connection` / Dispose) để giải phóng tài nguyên.
- **Mục đích**: Giúp tối ưu tốc độ đọc dữ liệu cực nhanh cho các tính năng tìm kiếm Real-time hoặc báo cáo doanh thu động đồ sộ vì dữ liệu được xử lý dạng luồng tuần tự mà không phải nạp toàn bộ danh sách khổng lồ vào RAM cùng lúc như EF Core.
- **File đang áp dụng**: [AdoTourRepository.cs](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/TravelTourBooking/TravelTourBooking.DAL/Repositories/AdoTourRepository.cs) và [ReportRepository.cs](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/TravelTourBooking/TravelTourBooking.DAL/Repositories/ReportRepository.cs#L55-L88).
- **Ví dụ thực tế**:
  ```csharp
  public async Task<IEnumerable<MonthlyRevenueDto>> GetMonthlyRevenueAsync(DateOnly? fromDate, DateOnly? toDate)
  {
      var result = new List<MonthlyRevenueDto>();
      using var conn = new SqlConnection(connectionString);
      using var cmd = new SqlCommand("sp_RevenueReport", conn) { CommandType = CommandType.StoredProcedure };
      
      cmd.Parameters.AddWithValue("@FromDate", fromDate ?? DBNull.Value);
      await conn.OpenAsync(); // MỞ KẾT NỐI
      using var reader = await cmd.ExecuteReaderAsync(); // TRUY VẤN DÒNG CHẢY DỮ LIỆU
      while (await reader.ReadAsync()) // ĐỌC DỮ LIỆU TỪ DÒNG KẾT NỐI ĐANG HOẠT ĐỘNG
      {
          result.Add(new MonthlyRevenueDto {
              TotalRevenue = reader.GetDecimal(reader.GetOrdinal("TotalRevenue"))
          });
      } // ĐÓNG KẾT NỐI tự động nhờ từ khoá 'using'
      return result;
  }
  ```

#### 6. ADO.NET Disconnected Model (Mô hình ngắt kết nối - SqlDataAdapter & DataSet)
- **Khái niệm**: Là mô hình kết nối không liên tục. Ứng dụng kết nối tới DB, tải toàn bộ dữ liệu cần thiết về lưu trữ tạm thời trong RAM của máy chủ ở các cấu trúc dữ liệu ngoại tuyến (`DataSet` / `DataTable`), sau đó ngắt kết nối với DB ngay lập tức. Mọi thao tác tìm kiếm, lọc, sửa đổi dữ liệu sau đó sẽ được thực hiện ngoại tuyến trên RAM máy chủ.
- **💡 Ẩn dụ thực tế ── Múc một xô nước:**
  - Bạn mang xô ra giếng múc đầy nước (`SqlDataAdapter.Fill` đổ dữ liệu vào `DataSet`).
  - Bạn xách xô nước đi về nhà, đóng cửa giếng ngay lập tức (Ngắt kết nối vật lý với Database).
  - Bạn thực hiện giặt giũ, nấu ăn, liên kết các ca nước ngoại tuyến hoàn toàn trên chiếc xô nước ở nhà của bạn (RAM máy chủ) mà không làm tốn tài nguyên hay cản trở bất kỳ ai dùng giếng nữa.
- **Mục đích & Lợi ích lý thuyết:**
  - **Giảm tải hệ thống:** Giảm thiểu tối đa tải trọng kết nối đồng thời (Concurrent Connections) lên máy chủ SQL Server, giúp database chịu tải được nhiều người dùng hơn.
  - **Thiết lập quan hệ ảo:** Có thể tự thiết lập các mối quan hệ logic giữa các bảng ngoại tuyến (`dataSet.Relations.Add`) ngay trong bộ nhớ RAM cực kỳ linh hoạt và nhanh chóng.
- **File đang áp dụng**: [AdoTourRepository.cs](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/TravelTourBooking/TravelTourBooking.DAL/Repositories/AdoTourRepository.cs) dòng 42-78 và [BookingRepository.cs](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/TravelTourBooking/TravelTourBooking.DAL/Repositories/BookingRepository.cs#L63-L122).
- **Ví dụ thực tế**:
  Trong `AdoTourRepository`:
  ```csharp
  public DataSet GetToursDataSet()
  {
      var ds = new DataSet("TourCatalog");
      using var conn = new SqlConnection(_cs);
      
      // Khai báo phà nạp bảng Tours
      using var adapter = new SqlDataAdapter("SELECT * FROM Tours WHERE IsActive=1", conn);
      adapter.Fill(ds, "Tours"); // Tự động Mở -> Đổ dữ liệu -> Đóng kết nối
      
      // Khai báo phà nạp bảng Schedules liên quan
      using var schedAdapter = new SqlDataAdapter("SELECT * FROM TourSchedules WHERE Status=N'Open'", conn);
      schedAdapter.Fill(ds, "Schedules"); // Tự động Mở -> Đổ dữ liệu -> Đóng kết nối

      // Tạo liên kết mối quan hệ giữa 2 bảng ngoại tuyến nằm hoàn toàn trên RAM máy chủ
      ds.Relations.Add("Tour_Schedules", 
          ds.Tables["Tours"].Columns["TourId"], 
          ds.Tables["Schedules"].Columns["TourId"]);
          
      return ds; // Dữ liệu nằm hoàn toàn độc lập, không còn giữ bất kỳ kết nối vật lý nào tới DB
  }
  ```

---

### 3.4. Shared & Cross-cutting (Common)

#### 1. DTO (Data Transfer Object)
- **Khái niệm**: Là các lớp học (Class) dữ liệu thuần túy chỉ chứa các thuộc tính (Properties) get/set mà không chứa bất kỳ logic nghiệp vụ nào, dùng để định dạng cấu trúc dữ liệu truyền tải giữa Client và Server hoặc giữa các Layer.
- **Mục đích**:
  - Không để lộ kiến trúc bảng bảo mật của CSDL thực tế ra môi trường API công cộng.
  - Tối ưu hóa băng thông truyền tải mạng bằng cách lọc bỏ các cột dữ liệu rác không cần thiết cho giao diện hiển thị (Ví dụ: Ẩn cột mật khẩu `PasswordHash` khi trả về thông tin Account).
- **File đang áp dụng**: Thư mục [DTOs](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/TravelTourBooking/TravelTourBooking.Common/DTOs).

#### 2. AutoMapper
- **Khái niệm**: Là thư viện hỗ trợ ánh xạ tự động dữ liệu từ đối tượng này sang đối tượng khác (Ví dụ: Từ Entity Model của EF Core sang DTO) dựa trên quy tắc trùng tên thuộc tính.
- **Mục đích**: Tránh việc viết mã thủ công nhàm chán lặp đi lặp lại dạng gán giá trị bằng tay: `dto.Name = entity.Name; dto.Price = entity.Price;...`
- **File đang áp dụng**: [MappingProfile.cs](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/TravelTourBooking/TravelTourBooking.BLL/Helpers/MappingProfile.cs).
- **Ví dụ thực tế**:
  ```csharp
  // Cấu hình mapping tự động: Tính trung bình đánh giá của Tour dựa trên bảng Reviews liên quan
  CreateMap<Tour, TourListDto>()
      .ForMember(d => d.CateName, o => o.MapFrom(t => t.Category != null ? t.Category.CateName : null))
      .ForMember(d => d.AvgRating, o => o.MapFrom(t =>
          t.Reviews.Any() ? Math.Round(t.Reviews.Average(r => (decimal)r.Rating), 1) : (decimal?)null));
  ```

#### 3. ApiResponse<T> (Định dạng phản hồi chuẩn)
- **Khái niệm**: Là một Wrapper Class (Lớp bao bọc) dùng để đóng gói tất cả các kết quả trả về từ API theo một cấu trúc dữ liệu JSON đồng nhất nhất quán.
- **Mục đích**: Giúp lập trình viên Frontend xây dựng cấu trúc xử lý dữ liệu chuẩn chỉ ở một nơi duy nhất.
- **File đang áp dụng**: [ApiResponse.cs](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/TravelTourBooking/TravelTourBooking.Common/DTOs/ApiResponse.cs).
- **Cấu trúc dữ liệu JSON chuẩn**:
  ```json
  {
    "success": true, 
    "message": "Đặt tour thành công.",
    "data": { ... } // Dữ liệu phản hồi thực tế
  }
  ```

#### 4. Dependency Injection (DI)
- **Khái niệm**: Là một mẫu thiết kế (design pattern) giúp hiện thực hóa nguyên lý Đảo ngược điều khiển (Inversion of Control - IoC). Thay vì các lớp tự khởi tạo các đối tượng phụ thuộc bằng từ khóa `new`, Framework ASP.NET Core sẽ đảm nhận việc tạo ra các đối tượng này và tự động "tiêm" (inject) chúng vào lớp cần thông qua hàm khởi tạo (constructor).
- **Mục đích**: Làm giảm độ phụ thuộc chéo giữa các tầng lớp, giúp code dễ bảo trì, dễ mở rộng và hỗ trợ viết kiểm thử phần mềm cực tốt.
- **Cấu hình**: Trong file [Program.cs](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/TravelTourBooking/TravelTourBooking.API/Program.cs#L22-L51) bằng các cơ chế vòng đời:
  - `AddScoped`: Tạo một đối tượng duy nhất cho mỗi yêu cầu HTTP (Phổ biến nhất cho Services và Repositories).
  - `AddSingleton`: Tạo duy nhất một đối tượng và dùng chung trong suốt vòng đời hoạt động của ứng dụng (Áp dụng cho `AdoTourRepository`).
  - `AddTransient`: Tạo mới đối tượng mỗi khi có yêu cầu tiêm vào.
- **Ví dụ thực tế**:
  Trong [Program.cs](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/TravelTourBooking/TravelTourBooking.API/Program.cs#L34): `builder.Services.AddScoped<IBookingRepository, BookingRepository>();`
  Lúc này, trong `BookingService` chỉ cần khai báo thông qua Constructor, ASP.NET Core sẽ tự động khởi tạo đối tượng truyền vào:
  ```csharp
  public class BookingService(IBookingRepository bookingRepo) : IBookingService { ... }
  ```

---

## 4. LUỒNG HOẠT ĐỘNG TOÀN DIỆN (REQUEST → RESPONSE FLOW)

Để bảo vệ đồ án xuất sắc, bạn cần mô tả trơn tru luồng đi của dữ liệu qua từng lớp. Dưới đây là phân tích chi tiết quy trình **Đặt Tour** từ giao diện Angular cho đến khi lưu trữ thành công vào Database và trả lại kết quả.

```text
[1. CLIENT SIDE - ANGULAR]
   - Khách hàng bấm nút "Xác nhận đặt tour" trên giao diện.
   - Component thu thập thông tin (ScheduleId, NumberOfPeople, Passengers...) và gọi BookingService.
   - HttpInterceptor tự động chèn JWT Token từ localStorage vào Header: "Authorization: Bearer <Token>".
   - Angular thực hiện gửi HTTP POST Request tới API Server: `https://localhost:7068/api/bookings`.
        │
        ▼
[2. PRESENTATION LAYER - WEB API]
   - Yêu cầu đi qua chuỗi Middleware. Lớp `ExceptionMiddleware` sẵn sàng bắt lỗi toàn cầu.
   - Máy chủ API kiểm tra tính hợp lệ của JWT Token, trích xuất vai trò tài khoản đăng nhập (Authorize).
   - Kiểm tra định dạng đầu vào thông qua `FluentValidation` (Khởi chạy ngầm trước khi vào Controller).
   - Router định hướng nhảy vào `BookingsController.Create(CreateBookingRequestDto dto)`.
   - Controller tiếp nhận DTO và chuyển tiếp (gọi) xuống BLL `IBookingService.CreateBookingAsync(dto)`.
        │
        ▼
[3. BUSINESS LOGIC LAYER - BLL]
   - Lớp `BookingService` nhận nhiệm vụ và bắt đầu kiểm tra tính toàn vẹn của dữ liệu thực tế (Business Rules):
       + Kiểm tra xem số hành khách khai báo có khớp với số lượng người đăng ký không.
       + Kiểm tra xem các hành khách người lớn có đầy đủ số CCCD không.
       + Kiểm tra xem có người liên hệ chính nào không.
   - Nếu vi phạm bất kỳ quy tắc nào, lập tức ném ra lỗi `throw new ArgumentException(...)`.
   - Nếu dữ liệu hợp lệ, dịch vụ chuyển tiếp yêu cầu xuống tầng dữ liệu `IBookingRepository.CreateBookingSpAsync(...)`.
        │
        ▼
[4. DATA ACCESS LAYER - DAL]
   - Lớp `BookingRepository` mở kết nối `SqlConnection` tới cơ sở dữ liệu dựa trên ConnectionString.
   - Tạo đối tượng `SqlCommand` gọi Stored Procedure tên là `sp_CreateBooking` trong SQL Server.
   - Đẩy các tham số đầu vào (@AccountId, @ScheduleId, @NumberOfPeople, @DiscountPercent) vào thủ tục.
   - Thực thi lệnh bằng phương thức `ExecuteScalarAsync()` để nhận lại ID của Đơn đặt chỗ vừa tạo.
        │
        ▼
[5. DATABASE LEVEL - SQL SERVER]
   - Thủ tục lưu trữ `sp_CreateBooking` được kích hoạt trên Server DB:
       + Kiểm tra xem lịch trình có tồn tại và đang trạng thái "Open" không.
       + Kiểm tra số lượng ghế trống còn lại (`AvailableSlots`) của Lịch trình du lịch.
       + Mở một giao dịch kết nối an toàn (BEGIN TRANSACTION).
       + Khoá tạm thời dòng lịch trình cần đặt để tránh xung đột đặt vé đồng thời (UPDLOCK, ROWLOCK).
       + Nếu ghế trống đủ, gọi hàm Scalar Function `dbo.fn_CalcBookingTotal` để tự động tính tổng tiền sau chiết khấu.
       + Thực hiện lệnh `INSERT INTO Bookings` lưu thông tin đặt chỗ.
       + Phát sinh bản ghi thành công kích hoạt ngay lập tức **Trigger `trg_AfterBookingInsert`**:
           * Tự động lấy số ghế trống của lịch trình du lịch trừ đi số lượng ghế vừa đặt.
           * Nếu số lượng ghế trống bằng 0, tự động cập nhật trạng thái lịch du lịch thành "Full".
       + Thực hiện Xác nhận lưu trữ (COMMIT TRANSACTION) và trả về ID đơn hàng mới.
        │
        ▼
[6. DÒNG PHẢN HỒI QUAY NGƯỢC LẠI (RESPONSE RETRIEVAL)]
   - Database trả về ID -> `BookingRepository` nhận ID -> Gọi EF Core truy vấn thông tin chi tiết bằng LINQ.
   - `BookingService` ánh xạ dữ liệu nhận được thành DTO thông qua `AutoMapper`.
   - `BookingsController` đóng gói DTO vào lớp `ApiResponse.Ok(...)` và trả về HTTP Status 201 Created.
   - Angular Client nhận kết quả JSON, hiển thị thông báo đặt tour thành công và chuyển hướng tới màn hình Lịch sử đặt vé.
```

---

## 5. PHÂN TÍCH TOÀN BỘ ĐỐI TƯỢNG CƠ SỞ DỮ LIỆU (DATABASE PROGRAMMING)

### 5.1. Các thủ tục lưu trữ (Stored Procedures - Cơ chế lập trình nội hàm hiệu năng cao)
Thay vì viết logic tính toán rườm rà ở ứng dụng BLL và gửi hàng loạt câu lệnh đơn lẻ qua môi trường mạng (gây suy giảm hiệu năng do độ trễ truyền dẫn mạng - Network Latency), hệ thống đã đóng gói toàn bộ các luồng nghiệp vụ phức tạp thành các **Stored Procedures** được biên dịch sẵn (Pre-compiled) trực tiếp dưới SQL Server. Việc này giúp máy chủ cơ sở dữ liệu tối ưu hóa kế hoạch thực thi (Execution Plan Cache) và chạy mã với tốc độ nhanh nhất.

1. **`sp_CreateBooking`** ([Chi tiết code](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/database/TravelBookingDB.sql#L253-L308)):
   - **Mục đích & Vai trò cốt lõi**: Đảm bảo an toàn dữ liệu tuyệt đối cho quy trình đặt vé và thanh toán tour du lịch.
   - **Kỹ thuật Concurrency Control (Kiểm soát truy cập đồng thời) nâng cao**:
     - **Transaction (Giao dịch ACID)**: Sử dụng khối lệnh `BEGIN TRANSACTION` và `COMMIT/ROLLBACK TRANSACTION` để thực hiện toàn bộ các bước kiểm tra chỗ trống, tính toán tổng tiền, và ghi nhận hóa đơn thành một đơn vị công việc nguyên tử (**Atomicity**). Nếu một bước nhỏ bị lỗi hoặc không đủ chỗ trống, toàn bộ quá trình sẽ bị hủy bỏ và đưa cơ sở dữ liệu về trạng thái ban đầu, tránh việc dữ liệu bị sai lệch cục bộ.
     - **Độc quyền khóa dòng (`UPDLOCK`, `ROWLOCK`)**: Khi truy vấn số ghế trống của một lịch khởi hành thông qua từ khóa `WITH (UPDLOCK, ROWLOCK)`, SQL Server sẽ lập tức cấp phát khóa cập nhật (Update Lock) cấp độ dòng dữ liệu (Row-level) lên bản ghi lịch trình du lịch đó. Cơ chế này ép buộc các luồng giao dịch đồng thời khác muốn đọc hoặc cập nhật dòng này phải xếp hàng chờ đợi, loại bỏ hoàn toàn hiện tượng tranh chấp tài nguyên mạng (**Race Conditions**) dẫn tới việc bán quá số chỗ thực tế cho phép (**Overbooking**).
2. **`sp_CancelBooking`** ([Chi tiết code](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/database/TravelBookingDB.sql#L311-L344)):
   - **Mục đích**: Thực hiện quy trình hủy đặt tour an toàn, cập nhật lại trạng thái hóa đơn và giải phóng ghế ngồi du lịch một cách nhất quán.
   - **Ràng buộc logic nghiêm ngặt**: SP chủ động kiểm tra trạng thái hiện tại của đơn hàng. Nếu đơn hàng đã ở trạng thái kết thúc hoàn tất (`Completed`) hoặc đã hủy từ trước (`Cancelled`), hệ thống sẽ ném lỗi thông báo ngoại lệ nhằm bảo vệ tính nhất quán tài chính doanh nghiệp.
3. **`sp_SearchTours`** ([Chi tiết code](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/database/TravelBookingDB.sql#L346-L374)):
   - **Mục đích**: Cung cấp công cụ tìm kiếm và lọc danh sách tour linh hoạt với hiệu năng cao.
   - **Kỹ thuật tối ưu hóa truy vấn**: Áp dụng cú pháp tìm kiếm gần đúng (`LIKE N'%' + @Destination + N'%'`) kết hợp linh hoạt mệnh đề logic kiểm tra giá trị trống (`@Destination IS NULL OR DestinationName LIKE ...`). Kỹ thuật này giúp SQL Server tái sử dụng hiệu quả kế hoạch thực thi chung, đồng thời tối ưu hóa chỉ mục tìm kiếm (Index Scan/Seek) trên bảng Destinations và Tours.
4. **`sp_RevenueReport`** ([Chi tiết code](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/database/TravelBookingDB.sql#L376-L396)):
   - **Mục đích**: Phân tích dữ liệu doanh thu tài chính tích lũy hỗ trợ Admin ra quyết định kinh doanh.
   - **Kỹ thuật xử lý**: Gom nhóm dữ liệu (`GROUP BY YEAR, MONTH`) các hóa đơn đã được xác nhận thanh toán hoặc hoàn thành, áp dụng các hàm gộp hiệu năng cao (`SUM`, `AVG`, `COUNT`) để tính toán tổng doanh số và mức chi tiêu trung bình nhanh chóng trực tiếp tại database.

### 5.2. Khung nhìn ảo (Views - Cơ chế ảo hóa và bảo mật dữ liệu)
Khung nhìn (Views) đóng vai trò là các truy vấn `SELECT` được đặt tên, biên dịch và lưu trữ sẵn trên CSDL, hoạt động như một bảng ảo để đơn giản hóa cấu trúc quan hệ phức tạp và tăng cường tính bảo mật dữ liệu.

1. **`vw_BookingDetails`** ([Chi tiết code](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/database/03_Views_Booking.sql#L18-L39)):
   - **Mục đích**: Chuẩn hóa thông tin hóa đơn đặt tour chi tiết cho các tầng phía trên truy xuất.
   - **Giải pháp liên kết**: Thực hiện phép `JOIN` 6 bảng quan hệ vật lý: `Bookings`, `Accounts`, `CustomerProfiles`, `TourSchedules`, `Tours`, và `Destinations`. Nhờ View, ứng dụng C# chỉ cần thực hiện câu truy vấn `SELECT` đơn giản từ 1 đối tượng ảo duy nhất thay vì viết các phép nối bảng rườm rà gây tốn băng thông bộ nhớ.
2. **`vw_TourRevenue`** ([Chi tiết code](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/database/TravelBookingDB.sql#L403-L416)):
   - **Mục đích**: Thống kê doanh thu tài chính lũy kế theo từng tour du lịch cụ thể phục vụ biểu đồ trực quan của trang Admin Dashboard.
3. **`vw_PopularTours`** ([Chi tiết code](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/database/TravelBookingDB.sql#L442-L461)):
   - **Mục đích**: Tính toán chỉ số yêu thích của Tour thông qua điểm số đánh giá trung bình từ khách hàng (`AVG(Rating)`) và số lượng vé đặt thành công để tự động đề xuất danh sách Tour nổi bật nhất lên màn hình Home của ứng dụng.

### 5.3. Trình kích hoạt tự động (Triggers - Đảm bảo toàn vẹn dữ liệu tầng thấp nhất)
Trình kích hoạt là các khối mã tự động thực thi (Event-driven) chạy ngầm trực tiếp dưới Database Server khi có các sự kiện thay đổi dữ liệu (`INSERT`, `UPDATE`, `DELETE`) trên các bảng chỉ định. Đây là lớp phòng ngự cuối cùng và tuyệt đối nhất để bảo toàn tính nhất quán dữ liệu của toàn hệ thống.

1. **`trg_AfterBookingInsert`** ([Chi tiết code](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/database/TravelBookingDB.sql#L467-L489)):
   - **Sự kiện & Cơ chế hoạt động**: Tự động kích hoạt ngay sau khi một bản ghi mới được thêm thành công vào bảng `Bookings`.
   - **Nhiệm vụ**: Đọc dữ liệu từ bảng ảo đầu vào `inserted` (chứa dòng dữ liệu vừa thêm), thực hiện phép trừ số ghế ngồi tương ứng trực tiếp vào bảng lịch trình du lịch (`AvailableSlots = AvailableSlots - NumberOfPeople`). Đồng thời, nếu số chỗ ngồi trống chạm mốc 0, Trigger tự động chuyển đổi trạng thái của Lịch trình đó sang `"Full"` để ngăn chặn khách hàng sau tiếp tục chọn lịch trình này.
2. **`trg_AfterBookingCancel`** ([Chi tiết code](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/database/TravelBookingDB.sql#L491-L518)):
   - **Sự kiện & Cơ chế hoạt động**: Tự động kích hoạt khi có thao tác cập nhật trạng thái đơn đặt tour sang `"Cancelled"`.
   - **Nhiệm vụ**: Tự động tính toán hoàn lại số lượng ghế ngồi du lịch đã đặt trước đó về cho lịch khởi hành (`AvailableSlots = AvailableSlots + NumberOfPeople`). Đồng thời, nếu lịch khởi hành đó đang ở trạng thái bị khóa `"Full"`, Trigger sẽ tự động khôi phục trạng thái về `"Open"` để tiếp nhận các lượt đặt chỗ mới từ các khách hàng khác.

### 5.4. Các hàm người dùng tự định nghĩa (User-Defined Functions - UDFs)
UDFs giúp đóng gói các công thức tính toán nghiệp vụ chuyên sâu thành các hàm có khả năng tái sử dụng cao trong các câu lệnh truy vấn SQL khác nhau.

1. **`fn_CalcBookingTotal`** ([Chi tiết code](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/database/TravelBookingDB.sql#L193-L217)):
   - **Loại**: Scalar Function (Hàm vô hướng trả về giá trị số thực đơn lẻ).
   - **Mục đích**: Đảm bảo công thức tính toán tài chính luôn nhất quán: `Thành tiền = (Đơn giá Tour * Số lượng hành khách) * (1 - Tỉ lệ chiết khấu / 100)`. Hàm này được triệu gọi tự động bên trong `sp_CreateBooking` để tự động hóa khâu điền dữ liệu cột `TotalAmount`.
2. **`fn_UserBookingCount`** ([Chi tiết code](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/database/TravelBookingDB.sql#L219-L237)):
   - **Mục đích**: Thống kê tổng số lượng đơn đặt tour thành công của một khách hàng cụ thể trong năm để hỗ trợ việc phân loại cấp bậc thành viên VIP và áp dụng các chính sách ưu đãi tri ân khách hàng.
3. **`fn_GenerateInvoiceCode`** ([Chi tiết code](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/database/TravelBookingDB.sql#L239-L247)):
   - **Mục đích**: Sinh mã hóa đơn chuyên nghiệp tự động theo cấu trúc định dạng chuẩn: `INV-{NĂM_HIỆN_TẠI}-{MÃ_ĐƠN_HÀNG_AUTO_INCREMENT}`.

---

## 6. CƠ CHẾ AUTHENTICATION & AUTHORIZATION (JWT + RBAC)

Sự phối hợp mượt mà giữa ứng dụng Angular Client và ASP.NET Core API đảm bảo hệ thống luôn được bảo mật ở mức độ cao nhất.

```text
  [ Angular Client ]                                              [ ASP.NET Core API ]
          │                                                                │
          │ 1. Đăng nhập (Email, Mật khẩu)                                 │
          ├───────────────────────────────────────────────────────────────>│
          │                                                                │ 2. Xác thực thông tin DB
          │                                                                │    Mã hóa mật khẩu: BCrypt
          │                                                                │    Tạo JWT Token (Role ký số)
          │ 3. Trả về Token JWT + Vai trò (Role)                           │
          |<───────────────────────────────────────────────────────────────┤
          │
  [ Lưu localStorage ]
  [ Cập nhật Reactive Signal: userRole ]
          │
          │ 4. Giao dịch tiếp theo (Đặt Tour / Quản lý)
          │    Đính kèm: Authorization: Bearer <Token>
          ├───────────────────────────────────────────────────────────────>│
          │                                                                │ 5. Middleware xác minh Token
          │                                                                │    Giải mã chữ ký số
          │                                                                │    Đọc Quyền hạn từ Claim
          │                                                                │    Áp dụng [Authorize(Roles = "...")]
          │ 6. Thực thi hành động và trả dữ liệu                           │
          |<───────────────────────────────────────────────────────────────┤
```

### Chi tiết các công nghệ bảo mật cốt lõi:
1. **Mã hóa và Băm mật khẩu bằng BCrypt (CPU-bound Hashing):**
   - Mật khẩu của người dùng **tuyệt đối không bao giờ** được lưu dưới dạng văn bản thuần túy (Plaintext). Hệ thống sử dụng thuật toán **BCrypt** ([Cài đặt thực tế](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/TravelTourBooking/TravelTourBooking.BLL/Services/AuthService.cs#L95-L101)) để băm mật mã kèm theo cơ chế tự sinh muối ngẫu nhiên (Salt) và lặp chu kỳ băm nhiều lần (Work Factor/Key Stretching).
   - Cơ chế này chống lại hiệu quả các cuộc tấn công dò mật khẩu quy mô lớn bằng bảng băm tính sẵn (Rainbow Tables) và hạn chế tối đa nguy cơ bị lộ mật mã ngay cả khi cơ sở dữ liệu vật lý bị hacker đánh cắp.
2. **Cơ chế xác thực phi trạng thái bằng JWT (Stateless Token Authentication):**
   - **Không duy trì Session trên Server**: Sau khi người dùng đăng nhập thành công, máy chủ API không lưu trữ bất kỳ trạng thái nào trên RAM hay File System của máy chủ. Toàn bộ thông tin danh tính, vai trò hành động của người dùng được mã hóa đóng gói vào chuỗi ký tự JWT mã hóa dạng Base64 và chuyển giao hoàn toàn cho Client lưu trữ (`localStorage`). Điều này giúp hệ thống có khả năng mở rộng quy mô tải (Scalability) vô hạn vì máy chủ không bị hao tổn tài nguyên RAM để quản lý phiên làm việc.
   - **Tính toàn vẹn nhờ chữ ký số (Digital Signature)**: Token JWT được bảo đảm an toàn bằng chữ ký mã hóa sử dụng thuật toán băm đối xứng nâng cao **HmacSha256** kết hợp khóa bí mật siêu cấp (`SecretKey`) cấu hình ở Server. Bất kỳ sự can thiệp, sửa đổi thông tin quyền hạn nào từ phía Client lên chuỗi Token sẽ lập tức làm sai lệch chữ ký số và bị Middleware xác thực chặn đứng ngay lập tức, trả về mã lỗi bảo mật HTTP 401 Unauthorized.
3. **Cơ chế phân quyền dựa trên vai trò (Role-Based Access Control - RBAC):**
   - Các quyền hạn truy cập của người dùng được định nghĩa thông qua các vai trò phân cấp rõ ràng (`Admin`, `Staff`, `Customer`).
   - Phía API, các Endpoint được bảo vệ nghiêm ngặt bằng thuộc tính khai báo `[Authorize(Roles = "Admin,Staff")]`. Khi request đi qua, hệ thống sẽ tự động đối sánh thuộc tính `ClaimTypes.Role` được giải mã từ JWT Token với yêu cầu của endpoint để cho phép thực thi hoặc từ chối hành động bằng mã lỗi HTTP 403 Forbidden.
4. **Bảo vệ hệ thống phía Client (Angular Security Flow):**
   - **HttpInterceptor (Bộ chặn HTTP tự động)**: Angular sử dụng bộ interceptor thông minh chạy ngầm. Bất cứ khi nào Client gửi yêu cầu HTTP Ajax lên máy chủ API, Interceptor sẽ tự động truy xuất chuỗi JWT Token từ bộ nhớ trong `localStorage` và đính kèm vào phần tiêu đề `Authorization: Bearer <Token>`, giúp đồng bộ hóa bảo mật cho tất cả các giao dịch mà không yêu cầu lập trình viên viết mã đính kèm thủ công ở từng API.
   - **Route Guards (Lớp bảo vệ thanh địa chỉ)**: Sử dụng các cơ chế bảo vệ Route Guard (`authGuard`, `roleGuard`) kết hợp cùng hệ thống trạng thái Reactive Signals để quản lý hiển thị. Nếu một người dùng chưa đăng nhập hoặc không đủ quyền quản trị cố tình nhập thủ công địa chỉ url cấm (Ví dụ: `https://localhost:4200/admin/dashboard`) lên thanh địa chỉ của trình duyệt, Route Guard sẽ lập tức phát hiện, chặn đứng quá trình chuyển trang và chuyển hướng người dùng về trang đăng nhập an toàn.

---

## 7. FAQ - CÁC CÂU HỎI PHẢN BIỆN BẢO VỆ ĐỒ ÁN (ĐẠT ĐIỂM A+)

Dưới đây là tập hợp những câu hỏi hóc búa nhất mà các giảng viên phản biện thường dùng để thử thách sinh viên, kèm theo các câu trả lời ngắn gọn, chuẩn chỉnh mang tính học thuật cao nhất.

### Q1: Vì sao em lại sử dụng kiến trúc 3 lớp (3-Layer Architecture) mà không viết toàn bộ mã nguồn vào một dự án duy nhất cho tiện?
> **Trả lời xuất sắc:** Em thiết kế hệ thống theo mô hình **3-Layer Architecture** nhằm áp dụng triệt để nguyên lý **Tách biệt trách nhiệm (Separation of Concerns - SoC)** và nguyên lý **Đơn nhiệm (Single Responsibility Principle - SRP)** trong thiết kế phần mềm. 
> - **Tính lỏng lẻo trong liên kết (Loose Coupling):** Bằng việc phân chia rõ ràng thành Presentation Layer (Web API), Business Logic Layer (BLL) và Data Access Layer (DAL), mỗi lớp chỉ đảm nhận một nhiệm vụ duy nhất và giao tiếp với nhau qua các giao diện định sẵn (Interfaces). Điều này giúp hệ thống cực kỳ dễ bảo trì và mở rộng. Nếu trong tương lai có sự thay đổi cấu trúc bảng hoặc chuyển đổi cơ sở dữ liệu (từ SQL Server sang PostgreSQL), em chỉ cần chỉnh sửa mã nguồn ở lớp DAL mà hoàn toàn không ảnh hưởng gì tới logic nghiệp vụ ở BLL hay giao diện API của Web API.
> - **Khả năng kiểm thử độc lập (Testability):** Thiết kế này cho phép chúng em viết các bài kiểm thử đơn vị (**Unit Tests**) độc lập cho tầng xử lý nghiệp vụ BLL bằng cách giả lập (mocking) dữ liệu đầu ra của DAL mà không cần phải kết nối vật lý thực tế tới cơ sở dữ liệu SQL Server đang chạy.

### Q2: Tại sao em vừa sử dụng Entity Framework Core (DbContext) lại vừa sử dụng cả ADO.NET truyền thống? Chúng hỗ trợ nhau như thế nào?
> **Trả lời xuất sắc:** Đây là một dụng ý thiết kế phối hợp theo mô hình **Hybrid Data Access Pattern** nhằm mục đích cân bằng hoàn hảo giữa **Năng suất phát triển ứng dụng (Developer Productivity)** và **Hiệu năng thực thi tối đa (Runtime Performance)**:
> - **Entity Framework Core (ORM)**: Đóng vai trò chủ đạo cho các tác vụ nghiệp vụ CRUD cơ bản (Thêm, sửa, xóa danh mục Category, Điểm đến Destination, Lịch trình Tour). EF Core giúp tự động hóa quá trình ánh xạ đối tượng, giảm thiểu 80% thời gian viết mã SQL thủ công và loại bỏ triệt để nguy cơ lỗi cú pháp nhờ cú pháp LINQ mạnh mẽ.
> - **ADO.NET Connected Model (SqlDataReader)**: Được em lựa chọn cho các tính năng tìm kiếm Tour đa tiêu chí và báo cáo tài chính lớn đòi hỏi hiệu năng cao. Cơ chế đọc luồng dữ liệu (Stream-based data access) của `SqlDataReader` cho phép dữ liệu đổ trực tiếp từ database về RAM máy chủ theo từng dòng tuần tự và giải phóng bộ nhớ ngay lập tức. Điều này vượt trội hoàn toàn so với EF Core vốn phải nạp toàn bộ danh sách bản ghi khổng lồ vào bộ nhớ RAM và chạy cơ chế Change Tracking cực kỳ tốn hiệu năng RAM.
> - **ADO.NET Disconnected Model (SqlDataAdapter & DataSet)**: Áp dụng cho các tính năng cần liên kết dữ liệu quan hệ phức tạp ngoại tuyến ngay trên bộ nhớ RAM của máy chủ API. Bằng cách sử dụng phà dữ liệu `SqlDataAdapter` nạp dữ liệu về cấu trúc `DataSet` ngoại tuyến và ngắt kết nối vật lý ngay lập tức, hệ thống giúp tiết kiệm tối đa tài nguyên cổng kết nối đồng thời (Concurrent Connections) của SQL Server, tăng khả năng chịu tải cho máy chủ cơ sở dữ liệu.

### Q3: Trong Stored Procedure `sp_CreateBooking` em có sử dụng Transaction và Lock để làm gì? Xử lý bài toán gì?
> **Trả lời xuất sắc:** Em sử dụng giao dịch **Database Transaction** kết hợp với cơ chế khóa dòng nâng cao (`UPDLOCK`, `ROWLOCK`) để giải quyết triệt để bài toán **Kiểm soát truy cập đồng thời (Concurrency Control)** và ngăn chặn hiện tượng tranh chấp tài nguyên mạng (**Race Conditions/Overbooking**).
> - **Bản chất vấn đề:** Khi hai hoặc nhiều khách hàng cùng lúc bấm nút đặt 1 chỗ ngồi cuối cùng duy nhất của một lịch trình tour tại cùng một tích tắc thời gian, nếu không có cơ chế khóa dòng, cả hai luồng xử lý đều đọc được thông tin chỗ trống là `1` và đều cho phép đặt tour, dẫn đến việc database ghi nhận đặt vượt mức cho phép.
> - **Giải pháp của em:** 
>   1. Em áp dụng giao dịch để đảm bảo tính toàn vẹn **ACID (nhất là tính Atomicity và Isolation)**.
>   2. Em sử dụng khóa dòng cập nhật (`WITH (UPDLOCK, ROWLOCK)`). Khi luồng giao dịch của khách hàng thứ nhất bắt đầu đọc số chỗ trống, SQL Server sẽ lập tức thiết lập khóa độc quyền lên dòng dữ liệu lịch trình đó. Khách hàng thứ hai truy cập vào sau bắt buộc phải rơi vào trạng thái chờ (Wait).
>   3. Sau khi luồng một kiểm tra đủ chỗ, ghi nhận hóa đơn thành công và tự động kích hoạt Trigger trừ số chỗ trống về `0` thì giao dịch thực hiện `COMMIT`, khóa dòng được giải phóng.
>   4. Lúc này luồng của khách hàng thứ hai mới được nhảy vào đọc dữ liệu, nhưng giá trị chỗ trống lúc này đã là `0`. SP lập tức phát hiện không đủ chỗ ngồi, kích hoạt lệnh `ROLLBACK` hủy giao dịch và trả về thông báo lỗi thân thiện cho khách hàng. Hệ thống được bảo vệ an toàn tuyệt đối.

### Q4: Sự khác nhau bản chất giữa "LINQ to Entities" và "LINQ to Objects" trong dự án của em là gì?
> **Trả lời xuất sắc:** Sự khác biệt cốt lõi nằm ở **Kiểu dữ liệu tác động**, **Cơ chế biên dịch/thực thi** và **Vùng nhớ xử lý dữ liệu**:
> - **LINQ to Entities** (tác động lên đối tượng kiểu `IQueryable<T>` tại tầng DAL): Cú pháp LINQ Lambda C# được EF Core phân tích dưới dạng một **Cây biểu thức (Expression Tree)**. Lúc này, câu lệnh hoàn toàn chưa chạy ngầm dưới Database. Chỉ khi chúng ta gọi các phương thức chuyển đổi dữ liệu thực tế như `.ToListAsync()` hoặc `.FirstOrDefaultAsync()`, EF Core mới chính thức biên dịch cây biểu thức đó thành câu lệnh SQL quan hệ (`SELECT ... WHERE...`), gửi xuống SQL Server thực thi và chỉ tải về RAM những bản ghi đã thỏa mãn điều kiện lọc. Kỹ thuật này giúp giảm thiểu tối đa băng thông truyền tải dữ liệu và tiết kiệm bộ nhớ RAM cho server.
> - **LINQ to Objects** (tác động lên danh sách kiểu `IEnumerable<T>` hoặc `List<T>` tại tầng BLL): Toàn bộ dữ liệu thô **đã được nạp và nằm sẵn trên bộ nhớ RAM** của máy chủ ứng dụng API. Em sử dụng LINQ to Objects để thực hiện các thao tác định dạng, sắp xếp thứ tự hoặc chuyển đổi kiểu dữ liệu thô từ database thành cấu trúc DTO thân thiện trước khi trả dữ liệu về giao diện người dùng.

### Q5: Em xử lý lỗi và ngoại lệ trong hệ thống như thế nào để đảm bảo an toàn bảo mật thông tin tối đa?
> **Trả lời xuất sắc:** Em thiết kế một cơ chế xử lý lỗi tập trung phi trạng thái bằng cách viết một **Global Exception Handling Middleware** đặt ở tầng API ([Chi tiết code](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/TravelTourBooking/TravelTourBooking.API/Middleware/ExceptionMiddleware.cs)).
> - **Cơ chế hoạt động:** Bất kỳ lỗi ngoại lệ nào xảy ra ở bất kỳ phân lớp nào (như lỗi kết nối Database ở DAL, lỗi vi phạm ràng buộc nghiệp vụ ở BLL) nếu không được bắt cục bộ sẽ tự động được ném lên và chặn bắt tập trung tại Middleware này.
> - **Giá trị bảo mật tối cao:** Trong môi trường thử nghiệm Development, Middleware sẽ hiển thị chi tiết vết lỗi (Stack Trace) phục vụ lập trình viên sửa lỗi nhanh. Tuy nhiên, khi hệ thống chạy ở môi trường thực tế Production, Middleware sẽ tự động ghi vết lỗi chi tiết vào file nhật ký Server (Security Logs), đồng thời đóng gói một thông điệp lỗi vô cùng thân thiện chuẩn hóa qua đối tượng `ApiResponse.Fail(message)` để trả về cho người dùng cuối. Việc này giúp **che giấu hoàn toàn cấu trúc vật lý của cơ sở dữ liệu** và mã nguồn bên dưới, ngăn chặn tuyệt đối hacker khai thác thông tin nhạy cảm của hệ thống qua các thông điệp báo lỗi.

### Q6: Cơ chế kích hoạt tự động (Triggers) trong Database đóng vai trò gì? Vì sao không xử lý logic đó hoàn toàn ở code C#?
> **Trả lời xuất sắc:** Việc cài đặt các Triggers (`trg_AfterBookingInsert`, `trg_AfterBookingCancel`) trực tiếp dưới cơ sở dữ liệu đóng vai trò thiết lập **lớp phòng ngự toàn vẹn dữ liệu ở mức độ thấp nhất và kiên cố nhất**:
> - **Lý do học thuật:** Nếu chúng ta chỉ xử lý logic cập nhật ghế trống trên lớp C# nghiệp vụ (BLL), hệ thống vẫn hoạt động tốt trong điều kiện lý tưởng. Tuy nhiên, nếu trong tương lai doanh nghiệp mở rộng quy mô hợp tác, có thêm một ứng dụng bên thứ ba (Ví dụ: Ứng dụng của đối tác đại lý du lịch liên kết) kết nối thẳng vào database của chúng ta để ghi dữ liệu, họ có thể quên chạy logic trừ ghế du lịch dẫn tới sai lệch dữ liệu nghiêm trọng. 
> - **Fail-safe Mechanism (Cơ chế chống lỗi vật lý):** Việc đặt Trigger dưới DB đảm bảo bất cứ ai, bất cứ ứng dụng nào thực hiện thay đổi dữ liệu lên bảng đặt vé đều bắt buộc phải chạy qua logic cập nhật ghế trống tự động này trực tiếp dưới hệ quản trị CSDL SQL Server, giữ cho dữ liệu hệ thống luôn chính xác tuyệt đối và loại bỏ hoàn toàn các lỗi sai sót từ yếu tố con người hoặc ứng dụng bên ngoài.

### Q7: Tại sao em lại sử dụng thư viện AutoMapper mà không thực hiện gán dữ liệu thuộc tính thủ công?
> **Trả lời xuất sắc:** Việc gán dữ liệu thuộc tính thủ công (`dto.Property = entity.Property`) là một phản mẫu thiết kế (Anti-pattern) gây tốn thời gian phát triển dự án, làm phình to kích thước dòng mã nguồn vô ích và rất dễ gây sai sót bỏ quên thuộc tính khi số lượng trường thông tin tăng lên.
> - **Mẫu thiết kế O/M Mapping**: **AutoMapper** tự động quét các cấu trúc thuộc tính có tên giống nhau giữa Entity và DTO để ánh xạ dữ liệu tự động theo cấu hình tập trung tại lớp `MappingProfile.cs`. 
> - **Lợi ích thực tế:** Cách làm này giúp mã nguồn dịch vụ nghiệp vụ ở BLL vô cùng gọn gàng, tăng tốc độ phát triển dự án lên gấp nhiều lần, giúp mã nguồn đạt tính thẩm mỹ cao và giúp đội ngũ lập trình viên tập trung 100% thời gian vào việc giải quyết các bài toán logic nghiệp vụ phức tạp của dự án.

---
*Chúc bạn tự tin bảo vệ đồ án trước hội đồng phản biện và đạt kết quả xuất sắc cao nhất!*
