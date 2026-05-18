# Hướng dẫn chạy Travel Tour Booking

Tài liệu gọn cho **database**, **appsettings** và **chạy API + frontend**.

---

## 1. Yêu cầu

| Thành phần | Phiên bản / ghi chú |
|------------|---------------------|
| SQL Server + SSMS | Đã cài instance (ví dụ `GIA-BAO\TRAININGSQL`, `.\SQLEXPRESS`) |
| .NET SDK | 9.x |
| Node.js | 18+ (frontend Angular) |

---

## 2. Database (SQL Server)

### 2.1. Cài mới — một lần (khuyến nghị)

1. Mở **SSMS** → kết nối instance SQL của bạn.
2. **Query → SQLCMD Mode** (hoặc `Ctrl+Shift+M`).
3. **File → Open** → `database/install.sql` → **Execute (F5)**.

Script tự chạy theo thứ tự:

| Bước | File | Việc làm |
|------|------|----------|
| 1 | `TravelBookingDB.sql` | Tạo DB `TravelBookingDB`, bảng, SP, trigger, seed cơ bản |
| 2 | `02_schema_extensions.sql` | Voucher, booking `Pending`, cột phiên thanh toán 2 phút |
| 3 | `03_seed_catalog.sql` | 48 tour, 4 danh mục; **xóa** tour/booking/payment cũ, **giữ** tài khoản |

**Không bật được SQLCMD?** Mở và Execute lần lượt 3 file trên (cùng thứ tự).

**Lỗi “database already exists”:** Xóa `TravelBookingDB` trong Object Explorer rồi chạy lại `install.sql`, hoặc chỉ chạy `database/upgrade_existing.sql` + `03_seed_catalog.sql` nếu chỉ cần nâng cấp.

### 2.2. DB đã có — chỉ cập nhật schema

- SSMS + SQLCMD Mode → Execute `database/upgrade_existing.sql`  
- **Không** chạy `03_seed_catalog.sql` nếu không muốn xóa toàn bộ tour/booking.

### 2.3. Tình huống khác

| Nhu cầu | File |
|---------|------|
| Reset tour, giữ account | Backup DB → `database/03_seed_catalog.sql` |
| Chỉ sửa ảnh tour (DB cũ, giữ booking) | `database/optional_patch_tour_images.sql` |

### 2.4. Kiểm tra

```sql
USE TravelBookingDB;
SELECT COUNT(*) AS TourCount FROM Tours;           -- kỳ vọng: 48
SELECT COUNT(*) AS VoucherCount FROM Vouchers;     -- kỳ vọng: 4
SELECT COL_LENGTH('Bookings', 'PaymentDeadlineAt'); -- không NULL = đã migrate phiên thanh toán
```

---

## 3. Cấu hình `appsettings.json`

**File:** `TravelTourBooking/TravelTourBooking.API/appsettings.json`  
**Mẫu SMTP:** `appsettings.Development.example.json`

### 3.1. SQL Server — `ConnectionStrings`

1. Trong SSMS, copy **Server name** (Connect to Server).
2. Sửa `DefaultConnection` — `Server` phải **trùng** instance SSMS.

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=GIA-BAO\\TRAININGSQL;Database=TravelBookingDB;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

| SSMS | Trong JSON |
|------|------------|
| `GIA-BAO\TRAININGSQL` | `Server=GIA-BAO\\TRAININGSQL` |
| `.\SQLEXPRESS` | `Server=.\\SQLEXPRESS` |
| `(localdb)\MSSQLLocalDB` | `Server=(localdb)\\MSSQLLocalDB` |

**Windows Auth:** dùng `Trusted_Connection=True` (không cần User/Password).  
**SQL Auth:** thêm `User Id=...;Password=...;` và bỏ `Trusted_Connection`.

### 3.2. Gmail SMTP — gửi email booking/thanh toán

```json
"Smtp": {
  "Enabled": true,
  "Host": "smtp.gmail.com",
  "Port": 587,
  "EnableSsl": true,
  "User": "your-email@gmail.com",
  "Password": "",
  "FromEmail": "your-email@gmail.com",
  "FromName": "Travel Tour"
}
```

1. Bật [xác minh 2 bước](https://myaccount.google.com/security) Google.
2. Tạo [Mật khẩu ứng dụng](https://myaccount.google.com/apppasswords) (16 ký tự).
3. **Không commit** mật khẩu thật — dùng User Secrets:

```powershell
cd TravelTourBooking\TravelTourBooking.API
dotnet user-secrets init
dotnet user-secrets set "Smtp:User" "your-email@gmail.com"
dotnet user-secrets set "Smtp:Password" "xxxx xxxx xxxx xxxx"
```

`appsettings.Development.json` **không** được ghi đè `Smtp:Password` placeholder (sẽ làm Gmail lỗi). Hoặc đặt biến môi trường `SMTP_PASSWORD`.

### 3.3. Thanh toán QR MoMo (tùy chọn)

```json
"Payment": {
  "MoMoQrPath": "/images/payment/momo-qr.jpg",
  "MoMoAccountName": "Tên hiển thị",
  "MoMoPhone": "09xxxxxxxx",
  "TransferNotePrefix": "TT"
}
```

Ảnh QR đặt tại: `TravelTourBooking.API/wwwroot/images/payment/momo-qr.jpg`.

### 3.4. JWT (dev)

Giữ `JwtSettings:SecretKey` đủ dài trên máy local; production nên đổi secret và không commit.

---

## 4. Chạy project

### 4.1. Backend API

```powershell
# Dừng instance API cũ nếu đang chạy (tránh lỗi khóa file DLL khi build)
Stop-Process -Name "TravelTourBooking.API" -Force -ErrorAction SilentlyContinue

cd TravelTourBooking\TravelTourBooking.API
dotnet build
dotnet run
```

- Swagger: `https://localhost:7068/swagger` (port có thể khác — xem console).
- Lỗi DB: kiểm tra `DefaultConnection` và đã chạy `install.sql`.

### 4.2. Frontend

```powershell
cd TravelTourBooking\frontend
npm install
npm start
```

Mở URL in trên terminal (thường `http://localhost:4200`).

### 4.3. Đăng nhập

- Tài khoản trong SQL seed (`admin@travel.com`, `an@gmail.com`) thường **chưa có mật khẩu** — đăng ký mới trên web hoặc dùng tài khoản đã đăng ký.
- Voucher mẫu: `HE2024`, `DHM2024`, `TRAVEL5`, `SUMMER15`.

---

## 5. Cấu trúc thư mục `database/`

| File | Khi nào dùng |
|------|----------------|
| `install.sql` | **Cài mới** — entry point (3 bước) |
| `TravelBookingDB.sql` | Schema gốc (gọi từ install) |
| `02_schema_extensions.sql` | Voucher + Pending + payment session |
| `03_seed_catalog.sql` | 48 tour; xóa catalog/booking cũ |
| `upgrade_existing.sql` | Chỉ patch schema, không seed |
| `optional_patch_tour_images.sql` | Tùy chọn — sửa ảnh theo TourId |

---

## 6. Lỗi thường gặp

| Triệu chứng | Cách xử lý |
|-------------|------------|
| Cannot copy `*.dll` — file locked | `Stop-Process -Name TravelTourBooking.API -Force` rồi `dotnet build` |
| Cannot open database | Chạy `install.sql`; kiểm tra tên DB và `Server` |
| Login failed for SQL | Sai instance hoặc quyền Windows/SQL Auth |
| Gmail / SMTP failed | App Password + User Secrets; `Smtp:Enabled: true` |
| Voucher không áp dụng | Chạy `upgrade_existing.sql` hoặc cài lại qua `install.sql` |

---

*Tài liệu chi tiết cũ (nếu cần tham khảo): `docs/GUIDE_DATABASE.md`, `docs/README_APPSETTINGS.md` — nội dung đã gộp vào file này.*
