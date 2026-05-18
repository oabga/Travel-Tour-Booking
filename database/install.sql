-- ============================================================
--  install.sql — Cài đặt TravelBookingDB từ đầu (máy mới / DB mới)
--
--  SSMS: Query → SQLCMD Mode (Ctrl+Shift+M) → Execute (F5)
--  Hoặc chạy lần lượt 3 file theo thứ tự trong GUID.md
-- ============================================================

PRINT N'=== [1/3] TravelBookingDB.sql — schema + dữ liệu mẫu cơ bản ===';
:r .\TravelBookingDB.sql
GO

PRINT N'=== [2/3] 02_schema_extensions.sql — Voucher, Pending, phiên thanh toán ===';
:r .\02_schema_extensions.sql
GO

PRINT N'=== [3/3] 03_seed_catalog.sql — 48 tour, 4 danh mục (xóa tour/booking cũ) ===';
:r .\03_seed_catalog.sql
GO

PRINT N'=== Cài đặt database hoàn tất. Tiếp theo: cấu hình appsettings và chạy API (xem GUID.md). ===';
GO
