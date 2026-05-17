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

Dự án áp dụng mô hình kiến trúc **3-Layer Architecture** chuẩn công nghiệp kết hợp với mô hình **Repository Pattern**. Đây là phương pháp giúp tách biệt các trách nhiệm phát triển (Separation of Concerns).

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

### Vai trò chi tiết của từng lớp (Layer):
1. **Presentation Layer (TravelTourBooking.API)**:
    - Là cổng giao tiếp duy nhất giữa hệ thống bên ngoài (Angular Client) với hệ thống xử lý nội bộ.
    - Tiếp nhận các HTTP Request (GET, POST, PUT, DELETE), giải mã thông tin đăng nhập từ token JWT, thực hiện phân quyền (Authorization) và trả về phản hồi theo một định dạng chuẩn chung (`ApiResponse<T>`).
2. **Business Logic Layer (TravelTourBooking.BLL)**:
    - Trái tim của hệ thống. Nơi kiểm soát mọi quy tắc nghiệp vụ (Business Rules). 
    - Ví dụ: Một khách hàng đặt tour thì số người đăng ký không được vượt quá số ghế còn trống của lịch trình, khách hàng là người lớn bắt buộc phải điền căn cước công dân (CCCD).
3. **Data Access Layer (TravelTourBooking.DAL)**:
    - Lớp duy nhất được phép tương tác trực tiếp với cơ sở dữ liệu (Database).
    - Lớp này sử dụng đa dạng các kỹ thuật từ EF Core cho đến ADO.NET để tối ưu hóa hiệu năng truy vấn cho từng trường hợp cụ thể.
4. **Shared Layer (TravelTourBooking.Common)**:
    - Nơi chứa các DTOs (Data Transfer Objects), Enums, và ApiResponse dùng chung để định kiểu dữ liệu khi truyền qua lại giữa các Layer mà không làm lộ cấu trúc bảng vật lý của Database.

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
- **Khái niệm**: Là một phương thức xác thực người dùng không lưu trạng thái trên server (stateless). Server sẽ cấp cho client một chuỗi mã hóa ký số dạng token sau khi đăng nhập thành công.
- **Mục đích**: Nhận diện danh tính người dùng mà không cần lưu trữ Session trên server, tăng khả năng mở rộng hệ thống.
- **Cách hoạt động**:
  1. Người dùng gửi Email + Password lên API `/api/auth/login`.
  2. Server kiểm tra thông tin, tạo ra chuỗi JWT chứa thông tin tài khoản (Claims: ID, Email, Quyền hạn) ký bằng khóa bí mật (`SecretKey`).
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

#### 3. RBAC (Role-Based Access Control)
- **Khái niệm**: Là cơ chế phân quyền truy cập dựa trên chức vụ hay vai trò (Role) của người dùng trong hệ thống.
- **Mục đích**: Bảo vệ các API nhạy cảm khỏi sự truy cập trái phép. Đảm bảo đúng người đúng việc.
- **Cách hoạt động**: Thuộc tính `[Authorize(Roles = "Admin,Staff")]` đặt trước các Action hoặc Controller sẽ chặn đứng mọi yêu cầu có Token JWT không chứa role tương ứng.
- **Vì sao hệ thống dùng**: Hệ thống có 3 nhóm người dùng rõ rệt: **Admin** (toàn quyền), **Staff** (quản lý lịch trình, xem thông tin đặt tour), **Customer** (chỉ đặt tour cá nhân).
- **File đang áp dụng**: Mọi Controller, ví dụ: [BookingsController.cs](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/TravelTourBooking/TravelTourBooking.API/Controllers/BookingsController.cs), [ToursController.cs](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/TravelTourBooking/TravelTourBooking.API/Controllers/ToursController.cs).
- **Ví dụ thực tế**:
  Chức năng lấy lịch sử tất cả các booking chỉ dành cho Admin và Staff:
  ```csharp
  [HttpGet("all")]
  [Authorize(Roles = "Admin,Staff")]
  public async Task<IActionResult> GetAllBookings() { ... }
  ```

#### 4. Exception Middleware (Global Error Handler)
- **Khái niệm**: Là một khối mã trung gian (Middleware) nằm trong chu trình xử lý request (pipeline) của ASP.NET Core để bắt tất cả các ngoại lệ (Exception) xảy ra trong toàn hệ thống.
- **Mục đích**: 
  - Đảm bảo hệ thống không bao giờ bị sập (Crash) hoặc trả về trang lỗi HTML mặc định xấu xí của trình duyệt.
  - Đồng bộ hóa định dạng lỗi trả về phía Client dưới dạng JSON đồng nhất.
  - Che giấu chi tiết lỗi hệ thống nhạy cảm (như lỗi kết nối DB, lỗi tên cột, tên bảng) để đảm bảo an ninh mạng.
- **Cách hoạt động**: Khi bất kỳ dòng code nào ở DAL, BLL hay Controller ném ra lỗi (`throw ex`), Middleware sẽ bắt lấy lỗi đó (`catch`), phân loại loại lỗi (ví dụ: `ArgumentException` -> HTTP 400, `KeyNotFoundException` -> HTTP 404), ghi nhật ký hệ thống (log), và đóng gói lỗi thành đối tượng `ApiResponse.Fail(lỗi)` rồi ghi đè vào luồng HTTP Response.
- **Vì sao hệ thống dùng**: Giúp các lập trình viên không cần viết các khối lệnh `try - catch` lặp đi lặp lại ở từng Controller, làm code sạch và dễ đọc hơn rất nhiều.
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

#### 1. Interface + Service Pattern
- **Khái niệm**: 
  - **Interface**: Là bản thiết kế hoặc hợp đồng định nghĩa các tính năng mà không chứa mã thực thi.
  - **Service**: Là lớp trực tiếp thực thi (implement) các hàm nghiệp vụ được định nghĩa trong Interface.
- **Mục đích**: Đảm bảo tính lỏng lẻo trong liên kết hệ thống (Loose Coupling), giúp dễ dàng thay đổi mã nguồn triển khai bên trong Service hoặc viết Unit Test độc lập.
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
- **Khái niệm**: Là các quy định logic ràng buộc các hoạt động nghiệp vụ của thế giới thực vào phần mềm.
- **Mục đích**: Ngăn ngừa dữ liệu không hợp lý đi vào cơ sở dữ liệu làm hỏng toàn vẹn hệ thống.
- **File đang áp dụng**: [BookingService.cs](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/TravelTourBooking/TravelTourBooking.BLL/Services/BookingService.cs) dòng 13-28.
- **Ví dụ thực tế**:
  Trong `BookingService`:
  ```csharp
  // Nghiệp vụ 1: Số khách hàng đăng ký điền thông tin phải bằng với số lượng đăng ký đặt chỗ
  if (dto.Passengers.Count != dto.NumberOfPeople)
      throw new ArgumentException("Số hành khách không khớp số lượng đăng ký.");

  // Nghiệp vụ 2: Khách hàng là người lớn (Adult) bắt buộc phải có thông tin CCCD hoặc Hộ Chiếu
  var adultsWithoutId = dto.Passengers
      .Where(p => p.PassengerType == "Adult" && string.IsNullOrWhiteSpace(p.PassengerIdNumber)).ToList();
  if (adultsWithoutId.Any())
      throw new ArgumentException("Khách hàng người lớn bắt buộc có CCCD/Hộ chiếu.");

  // Nghiệp vụ 3: Đơn đặt chỗ bắt buộc phải có ít nhất một hành khách là người liên hệ chính
  if (!dto.Passengers.Any(p => p.IsPrimaryContact))
      throw new ArgumentException("Phải có ít nhất 1 hành khách làm liên hệ chính.");
  ```

#### 3. LINQ to Objects
- **Khái niệm**: Là ngôn ngữ truy vấn tích hợp trong C# dùng để thực hiện các thao tác tìm kiếm, sắp xếp, biến đổi cấu trúc dữ liệu trên các mảng, danh sách (`IEnumerable`, `List`) đang nằm trong bộ nhớ RAM.
- **Mục đích**: Xử lý, tính toán hoặc định dạng dữ liệu linh hoạt sau khi dữ liệu đã được tải từ Database lên.
- **File đang áp dụng**: Các file trong thư mục BLL Services, ví dụ [BookingService.cs](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/TravelTourBooking/TravelTourBooking.BLL/Services/BookingService.cs#L86-L111).
- **Ví dụ thực tế**:
  Chuyển đổi (Projection) từ đối tượng thực thể `Booking` sang DTO `BookingResponseDto` ngay trong bộ nhớ RAM bằng cú pháp LINQ:
  ```csharp
  private static BookingResponseDto MapToResponse(Booking booking) {
      return new BookingResponseDto {
          BookingId = booking.BookingId,
          TotalAmount = booking.TotalAmount,
          Passengers = booking.BookingDetails.Select(d => new PassengerResponseDto {
              PassengerName = d.PassengerName,
              PassengerType = d.PassengerType
          }).ToList() // LINQ to Objects biến đổi danh sách trong RAM
      };
  }
  ```

#### 4. FluentValidation
- **Khái niệm**: Là thư viện bên thứ ba mạnh mẽ giúp viết các quy tắc kiểm tra tính hợp lệ của dữ liệu đầu vào (Input Validation) bằng cách sử dụng cú pháp dạng Lambda (Fluent Interface).
- **Mục đích**: Tách biệt logic kiểm tra tính đúng đắn của dữ liệu ra khỏi tầng nghiệp vụ và Controller, giúp mã nguồn sạch hơn so với cách dùng các thuộc tính DataAnnotations như `[Required]`, `[StringLength]` lỗi thời.
- **Cách hoạt động**: Khi một DTO được gửi tới API Controller, thư viện tự động chặn và chạy qua Validator tương ứng. Nếu vi phạm bất cứ ràng buộc nào, API lập tức dừng lại và trả về lỗi HTTP 400 kèm thông báo tương ứng.
- **File đang áp dụng**: Thư mục [Validators](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/TravelTourBooking/TravelTourBooking.BLL/Validators).
- **Ví dụ thực tế**:
  Trong [TourValidator.cs](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/TravelTourBooking/TravelTourBooking.BLL/Validators/TourValidator.cs):
  ```csharp
  public class TourValidator : AbstractValidator<TourRequestDto>
  {
      public TourValidator()
      {
          RuleFor(x => x.TourName)
              .NotEmpty().WithMessage("Tên tour không được để trống.")
              .MaximumLength(150).WithMessage("Tên tour tối đa 150 ký tự.");

          RuleFor(x => x.DurationDays)
              .InclusiveBetween(1, 30).WithMessage("Số ngày phải từ 1 đến 30.");

          RuleFor(x => x.Price)
              .GreaterThan(0).WithMessage("Giá tour phải lớn hơn 0.");
      }
  }
  ```

---

### 3.3. Data Access Layer (DAL)

#### 1. Entity Framework Core DbContext
- **Khái niệm**: Là một thư viện ORM (Object-Relational Mapper) hiện đại của Microsoft, ánh xạ các bảng vật lý trong SQL Server thành các đối tượng class C# tương ứng để thực hiện các thao tác CRUD dữ liệu thông qua ngôn ngữ hướng đối tượng mà không cần viết lệnh SQL.
- **Mục đích**: Đóng vai trò là cầu nối phiên dịch giữa thế giới Lập trình hướng đối tượng (C#) và thế giới Cơ sở dữ liệu quan hệ (SQL Server).
- **Cách hoạt động**: Lớp `DbContext` đại diện cho một phiên làm việc với database. Các thuộc tính `DbSet<T>` đóng vai trò là đại diện cho các bảng vật lý.
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

#### 2. LINQ to Entities
- **Khái niệm**: Là các truy vấn LINQ viết bằng mã C# tác động lên thuộc tính `IQueryable` của EF Core. 
- **Mục đích**: Thực hiện lọc, gộp dữ liệu từ phía C#.
- **Cách hoạt động**: EF Core sẽ phân tích cú pháp C# Lambda này và tự động dịch nó thành một câu lệnh SQL (`SELECT ... WHERE ... JOIN ...`) rồi gửi lệnh đó xuống SQL Server thực thi, thu kết quả trả về và gán lại cho các đối tượng C#.
- **Vì sao hệ thống dùng**: Tránh viết SQL chay lồng trong C# dễ gây lỗi chính tả và bảo vệ hệ thống tuyệt đối khỏi lỗi tấn công chèn mã độc (SQL Injection).
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

#### 3. Generic Repository + Specific Repository Pattern
- **Khái niệm**:
  - **Generic Repository**: Lớp thiết kế tổng quát chứa các phương thức CRUD cơ bản áp dụng chung cho mọi bảng (`GetAll`, `GetById`, `Add`, `Update`, `Delete`).
  - **Specific Repository**: Lớp kế thừa từ Generic Repository và mở rộng thêm các hàm truy vấn đặc thù chỉ bảng đó mới có.
- **Mục đích**: Tránh lặp lại mã nguồn viết các câu lệnh thêm, sửa, xóa cơ bản cho từng thực thể.
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

#### 5. ADO.NET Connected Model (SqlDataReader)
- **Khái niệm**: Là mô hình lập trình cơ sở dữ liệu truyền thống, yêu cầu duy trì kết nối liên tục, ổn định từ ứng dụng tới Database trong suốt quá trình đọc dữ liệu.
- **Cách hoạt động**:
  - Tạo `SqlConnection`, mở kết nối bằng `Open()`.
  - Tạo `SqlCommand` truyền vào câu lệnh SQL hoặc tên Stored Procedure.
  - Sử dụng `SqlDataReader` thông qua hàm `ExecuteReaderAsync()`. 
  - Sử dụng vòng lặp `while(reader.Read())` để duyệt qua từng dòng dữ liệu từ luồng (stream) truyền trực tiếp từ Server DB về RAM, sau đó chủ động đóng kết nối ngay lập tức để giải phóng tài nguyên.
- **Mục đích**: Giúp tối ưu tốc độ đọc dữ liệu cực nhanh cho các tính năng tìm kiếm Real-time hoặc báo cáo dung lượng lớn vì dữ liệu được xử lý dạng luồng tuần tự mà không phải nạp toàn bộ danh sách đồ sộ vào bộ nhớ RAM cùng lúc như EF Core.
- **File đang áp dụng**: [AdoTourRepository.cs](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/TravelTourBooking/TravelTourBooking.DAL/Repositories/AdoTourRepository.cs) hàm `SearchToursDataTableAsync` và [ReportRepository.cs](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/TravelTourBooking/TravelTourBooking.DAL/Repositories/ReportRepository.cs#L55-L88).
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

#### 6. ADO.NET Disconnected Model (SqlDataAdapter & DataSet)
- **Khái niệm**: Là mô hình kết nối không liên tục. Ứng dụng kết nối tới DB, tải toàn bộ dữ liệu cần thiết về lưu trữ tạm thời trong RAM của máy chủ ở các cấu trúc dữ liệu ngoại tuyến (`DataSet` / `DataTable`), sau đó ngắt kết nối với DB ngay lập tức. Mọi thao tác tìm kiếm, lọc, sửa đổi dữ liệu sau đó sẽ được thực hiện ngoại tuyến trên RAM.
- **Cách hoạt động**:
  - Dùng `SqlDataAdapter` đóng vai trò là "chiếc phà" trung chuyển.
  - Sử dụng hàm `adapter.Fill(dataSet)` để tự động mở kết nối, truy vấn dữ liệu từ DB, đổ đầy vào cấu trúc dữ liệu offline `DataSet` và tự ngắt kết nối ngay lập tức.
  - Thực hiện liên kết quan hệ trong bộ nhớ RAM ngoại tuyến (`dataSet.Relations.Add`).
- **Mục đích**: Giảm thiểu tải trọng kết nối đồng thời lên máy chủ SQL Server. Thích hợp cho các màn hình cấu hình thông tin tĩnh ít biến động như danh mục tour du lịch kết hợp danh sách lịch trình liên quan.
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

Đây là điểm nhấn học thuật đắt giá nhất của dự án. Giáo viên chấm cơ sở dữ liệu sẽ vô cùng hài lòng khi bạn nắm chắc các đối tượng nâng cao này.

### 5.1. Các thủ tục lưu trữ (Stored Procedures)
Thay vì viết logic tính toán lằng nhằng ở ứng dụng và gửi nhiều lệnh đơn lẻ xuống DB, hệ thống đóng gói toàn bộ quy trình xử lý phức tạp thành các Stored Procedures trực tiếp trên SQL Server.

1. **`sp_CreateBooking`** ([Chi tiết code](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/database/TravelBookingDB.sql#L253-L308)):
   - **Mục đích**: Xử lý logic đặt tour phức tạp đảm bảo an toàn giao dịch.
   - **Điểm đặc biệt**: Sử dụng cơ chế Transaction (`BEGIN TRAN`, `COMMIT`, `ROLLBACK`) kết hợp khóa dòng nâng cao (`UPDLOCK`, `ROWLOCK`) để ngăn chặn tuyệt đối tình trạng đặt trùng chỗ (Overbooking) khi có hàng ngàn người cùng đặt một tour tại cùng một giây.
2. **`sp_CancelBooking`** ([Chi tiết code](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/database/TravelBookingDB.sql#L311-L344)):
   - **Mục đích**: Xử lý hủy đặt tour du lịch một cách an toàn.
   - **Logic ràng buộc**: Kiểm tra nếu trạng thái đơn đặt tour đang là "Completed" (đã đi tour về) hoặc "Cancelled" (đã hủy rồi) thì lập tức báo lỗi cấm hủy, ngược lại cập nhật trạng thái đơn hàng về "Cancelled".
3. **`sp_SearchTours`** ([Chi tiết code](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/database/TravelBookingDB.sql#L346-L374)):
   - **Mục đích**: Tìm kiếm tour linh hoạt đa tiêu chí (Điểm đến, Khoảng giá, Ngày khởi hành).
   - **Kỹ thuật tối ưu**: Tìm kiếm gần đúng (`LIKE N'%' + @Destination + N'%'`) kết hợp bắt điều kiện NULL (`@Destination IS NULL OR ...`) giúp client tìm kiếm tùy ý điền hoặc trống tham số.
4. **`sp_RevenueReport`** ([Chi tiết code](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/database/TravelBookingDB.sql#L376-L396)):
   - **Mục đích**: Báo cáo doanh thu tài chính theo năm tháng. Gom nhóm dữ liệu (`GROUP BY YEAR, MONTH`) các hóa đơn có trạng thái Confirmed hoặc Completed để tính tổng tiền và giá trị trung bình trên mỗi đơn.

### 5.2. Khung nhìn (Views)
Khung nhìn là các truy vấn SELECT được biên dịch và lưu trữ sẵn trên CSDL giúp đơn giản hóa cấu trúc dữ liệu cho mã nguồn ứng dụng C#.

1. **`vw_BookingDetails`** ([Chi tiết code](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/database/03_Views_Booking.sql#L18-L39)):
   - **Mục đích**: Tổng hợp thông tin hóa đơn đặt tour chi tiết.
   - **Liên kết**: Thực hiện phép `JOIN` 6 bảng liên quan: `Bookings`, `Accounts`, `CustomerProfiles`, `TourSchedules`, `Tours`, và `Destinations`.
2. **`vw_TourRevenue`** ([Chi tiết code](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/database/TravelBookingDB.sql#L403-L416)):
   - **Mục đích**: Thống kê doanh thu chi tiết tích lũy theo từng Tour du lịch phục vụ vẽ biểu đồ của Admin.
3. **`vw_PopularTours`** ([Chi tiết code](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/database/TravelBookingDB.sql#L442-L461)):
   - **Mục đích**: Thống kê mức độ yêu thích của Tour. Tính điểm đánh giá trung bình (`AVG(Rating)`) và đếm số lượng người đã đặt để xếp hạng các tour nổi bật (Popular Tours).

### 5.3. Trình kích hoạt tự động (Triggers)
Trình kích hoạt là các khối mã SQL tự động chạy khi phát sinh thao tác ghi dữ liệu (INSERT, UPDATE, DELETE) giúp đảm bảo sự nhất quán dữ liệu mà không cần sự can thiệp của lập trình viên.

1. **`trg_AfterBookingInsert`** ([Chi tiết code](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/database/TravelBookingDB.sql#L467-L489)):
   - **Sự kiện kích hoạt**: Chạy NGAY SAU khi có bản ghi mới được thêm thành công vào bảng `Bookings`.
   - **Hành động**: Đọc thông tin từ bảng ảo đầu vào `inserted`, cập nhật số ghế trống còn lại của lịch trình du lịch (`AvailableSlots = AvailableSlots - NumberOfPeople`). Nếu số chỗ còn lại chạm mức 0, tự động cập nhật trạng thái lịch thành "Full".
2. **`trg_AfterBookingCancel`** ([Chi tiết code](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/database/TravelBookingDB.sql#L491-L518)):
   - **Sự kiện kích hoạt**: Chạy NGAY SAU khi cập nhật trạng thái đơn hàng trong bảng `Bookings`.
   - **Hành động**: Kiểm tra xem trường trạng thái có đổi sang "Cancelled" từ trạng thái khác không. Nếu đúng, tự động cộng hoàn lại số ghế ngồi cho lịch trình du lịch đó và chuyển trạng thái lịch trình sang "Open" nếu trước đó lịch đang bị khóa ở trạng thái "Full".

### 5.4. Các hàm người dùng tự định nghĩa (User-Defined Functions)
1. **`fn_CalcBookingTotal`** ([Chi tiết code](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/database/TravelBookingDB.sql#L193-L217)):
   - **Loại**: Scalar Function (Hàm vô hướng trả về một giá trị duy nhất).
   - **Mục đích**: Tự động tính toán tổng số tiền của đơn hàng: `Giá Tour * Số Người * (1 - Chiết khấu/100)`.
2. **`fn_UserBookingCount`** ([Chi tiết code](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/database/TravelBookingDB.sql#L219-L237)):
   - **Mục đích**: Đếm số lần đặt tour thành công của một tài khoản trong năm chỉ định để phục vụ phân tích hành vi khách hàng VIP.
3. **`fn_GenerateInvoiceCode`** ([Chi tiết code](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/database/TravelBookingDB.sql#L239-L247)):
   - **Mục đích**: Tự động sinh mã hóa đơn theo quy chuẩn dạng chuỗi: `INV-{NĂM_HIỆN_TẠI}-{MÃ_ĐƠN_HÀNG}` (Ví dụ: `INV-2026-0001`).

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

### Cách thức hoạt động chi tiết:
- **Phía Backend**:
  - Khi đăng ký/đăng nhập, mật khẩu của người dùng được mã hóa bằng thuật toán băm một chiều an toàn cao cấp **BCrypt** ([Đăng nhập](file:///c:/Workplace/LTCSDL/BTL/Project_Code/Travel-Tour-Booking/TravelTourBooking/TravelTourBooking.BLL/Services/AuthService.cs#L95-L101)).
  - Trong `Program.cs`, chúng ta đăng ký gói dịch vụ xác thực JwtBearer. Khi yêu cầu HTTP truyền tới API, dịch vụ sẽ tự động giải nén chuỗi token để nạp thông tin quyền hạn vào thuộc tính danh tính người dùng trong phiên làm việc hiện tại (`HttpContext.User`).
- **Phía Frontend**:
  - Angular sử dụng `jwtInterceptor` tự động bắt mọi yêu cầu HTTP hướng ra ngoài và chèn mã Authorization Token vào.
  - Sử dụng **Route Guards** (`authGuard`, `roleGuard`) để ngăn chặn việc người dùng gõ URL thủ công trên thanh địa chỉ trình duyệt nhằm cố ý truy cập trái phép vào các khu vực cấm (như màn hình Admin).

---

## 7. FAQ - CÁC CÂU HỎI PHẢN BIỆN BẢO VỆ ĐỒ ÁN (ĐẠT ĐIỂM A+)

Dưới đây là tập hợp những câu hỏi hóc búa nhất mà các giảng viên phản biện thường dùng để thử thách sinh viên, kèm theo các câu trả lời ngắn gọn, chuẩn chỉnh mang tính học thuật cao nhất.

### Q1: Vì sao em lại sử dụng kiến trúc 3 lớp (3-Layer Architecture) mà không viết toàn bộ mã nguồn vào một dự án duy nhất cho tiện?
> **Trả lời:** Em sử dụng kiến trúc 3 lớp nhằm đạt được nguyên lý **Tách biệt trách nhiệm (Separation of Concerns)**. 
> - Thứ nhất, giúp mã nguồn có tính tổ chức cao, dễ bảo trì, dễ mở rộng độc lập. Ví dụ, nếu chúng ta thay đổi cấu trúc bảng trong cơ sở dữ liệu (DAL), chúng ta chỉ cần cập nhật tầng DAL mà hoàn toàn không cần phải sửa một dòng mã nào ở tầng trình diễn (Presentation Layer).
> - Thứ hai, giúp tăng tính tái sử dụng mã nguồn và khả năng kiểm thử độc lập (Unit Test) cho từng dịch vụ nghiệp vụ của hệ thống một cách dễ dàng.

### Q2: Tại sao em vừa sử dụng Entity Framework Core (DbContext) lại vừa sử dụng cả ADO.NET truyền thống? Chúng hỗ trợ nhau như thế nào?
> **Trả lời:** Đây là dụng ý thiết kế phối hợp để tối ưu hóa hiệu năng và tốc độ phát triển ứng dụng:
> - **EF Core** (DbContext): Em dùng để xử lý các nghiệp vụ cơ bản CRUD (Thêm, sửa, xóa các bảng như Danh mục Category, Điểm đến Destination) giúp rút ngắn 80% thời gian code nhờ cơ chế ORM tự động phát sinh câu lệnh SQL an toàn.
> - **ADO.NET Connected Mode** (SqlDataReader): Em sử dụng cho các nghiệp vụ tìm kiếm nâng cao đa tiêu chí (`sp_SearchTours`) và báo cáo doanh thu động (`sp_RevenueReport`). Kỹ thuật này giúp đọc luồng dữ liệu cực nhanh với lượng bản ghi khổng lồ trực tiếp từ Database lên máy khách mà không bị nghẽn bộ nhớ RAM như cơ chế tracking của EF Core.
> - **ADO.NET Disconnected Mode** (SqlDataAdapter & DataSet): Em sử dụng cho các chức năng cần xử lý dữ liệu liên kết quan hệ phức tạp ngoại tuyến nằm hoàn toàn trên RAM máy chủ nhằm ngắt kết nối vật lý ngay lập tức để tiết kiệm tài nguyên kết nối đồng thời của SQL Server.

### Q3: Trong Stored Procedure `sp_CreateBooking` em có sử dụng Transaction và Lock để làm gì?
> **Trả lời:** Em sử dụng giao dịch **Transaction** kết hợp khóa dòng nâng cao (`UPDLOCK`, `ROWLOCK`) để xử lý bài toán **Xung đột truy cập đồng thời (Concurrency Control)**. 
> Khi có nhiều khách hàng cùng thực hiện đặt chỗ cho một Lịch trình du lịch chỉ còn duy nhất 1 chỗ trống tại cùng một thời điểm:
> - Lock (`UPDLOCK`, `ROWLOCK`) sẽ khóa tạm thời bản ghi của lịch trình đó từ lúc khách hàng đầu tiên bắt đầu giao dịch. Các khách hàng sau sẽ phải xếp hàng chờ đợi.
> - Transaction đảm bảo tính toàn vẹn **ACID**. Nếu việc đặt chỗ của khách hàng đầu tiên thành công và số ghế trống bị trừ đi, giao dịch được COMMIT. Lúc này, khách hàng thứ hai được mở khóa dòng dữ liệu, SP sẽ chạy tiếp, phát hiện số chỗ trống còn lại là 0 và lập tức trả lỗi "Không đủ chỗ trống" thông qua cơ chế ROLLBACK, ngăn chặn hoàn toàn lỗi bán vượt quá số ghế thực tế (Overbooking).

### Q4: Sự khác nhau bản chất giữa "LINQ to Entities" và "LINQ to Objects" trong dự án của em là gì?
> **Trả lời:** Sự khác nhau bản chất nằm ở thời điểm biên dịch, thực thi câu lệnh và vùng bộ nhớ:
> - **LINQ to Entities** (tác động lên đối tượng `IQueryable` ở DAL): Cú pháp C# Lambda sẽ **chưa chạy ngay** trên RAM mà được bộ biên dịch của EF Core dịch toàn bộ thành câu lệnh SQL thuần (`SELECT ... WHERE...`) rồi gửi xuống SQL Server chạy. Dữ liệu chỉ được lọc và tải lên RAM máy chủ sau khi ta gọi hàm truy xuất dạng `ToListAsync()`.
> - **LINQ to Objects** (tác động lên danh sách `IEnumerable` ở BLL): Dữ liệu **đã nằm sẵn** trên RAM máy chủ sau khi tải từ DB lên. Chúng ta sử dụng LINQ để lọc, sắp xếp, chuyển đổi cấu trúc dữ liệu thô sang cấu trúc DTO phục vụ cho mục đích hiển thị giao diện.

### Q5: Em xử lý lỗi và ngoại lệ trong hệ thống như thế nào để đảm bảo tính an toàn bảo mật thông tin?
> **Trả lời:** Em xây dựng một cơ chế xử lý lỗi tập trung thông qua **Exception Middleware** đặt ở tầng API:
> - Mọi lỗi phát sinh ở bất kỳ tầng nào (DAL, BLL) đều được ném lên và chặn bắt tại đây.
> - Về mặt bảo mật: Chúng em ghi chi tiết lỗi gốc vào nhật ký hệ thống (log) của Server để lập trình viên theo dõi, nhưng đối với người dùng cuối, Middleware chỉ đóng gói thông báo lỗi thân thiện thông qua định dạng chuẩn `ApiResponse.Fail(message)` và che giấu toàn bộ cấu trúc DB bên dưới để ngăn chặn hacker khai thác thông tin nhạy cảm của hệ thống qua thông điệp báo lỗi.

### Q6: Cơ chế kích hoạt tự động (Triggers) trong Database đóng vai trò gì? Vì sao không xử lý logic đó hoàn toàn ở code C#?
> **Trả lời:** Trình kích hoạt `trg_AfterBookingInsert` và `trg_AfterBookingCancel` được thiết kế chạy trực tiếp dưới Database để đảm bảo **tính toàn vẹn dữ liệu ở tầng thấp nhất**. 
> Nếu chúng ta chỉ viết logic cập nhật ghế trống trên code C# BLL, trong tương lai nếu có một hệ thống khác (Ví dụ: Một đối tác bán vé liên kết) kết nối thẳng vào database của chúng ta để ghi dữ liệu, họ có thể quên chạy logic trừ ghế du lịch dẫn tới sai lệch dữ liệu nghiêm trọng. Việc đặt Trigger dưới DB đảm bảo bất cứ ai thực hiện ghi đè dữ liệu lên bảng đặt vé đều bắt buộc phải chạy qua logic cập nhật ghế trống tự động này, giữ cho dữ liệu hệ thống luôn chính xác tuyệt đối.

### Q7: Tại sao em lại sử dụng AutoMapper mà không gán dữ liệu thủ công?
> **Trả lời:** Việc gán dữ liệu thủ công (`dto.Property = entity.Property`) rất tốn thời gian, dễ gây sai sót và làm phình to kích thước mã nguồn một cách không cần thiết. **AutoMapper** tự động quét các cấu trúc thuộc tính có tên giống nhau giữa Entity và DTO để ánh xạ dữ liệu nhanh chóng. Điều này giúp mã nguồn dịch vụ ở BLL cực kỳ gọn gàng, tăng tốc độ phát triển dự án và giúp lập trình viên tập trung 100% vào việc giải quyết các bài toán logic nghiệp vụ cốt lõi.

---
*Chúc bạn tự tin bảo vệ đồ án và đạt kết quả xuất sắc cao nhất!*
