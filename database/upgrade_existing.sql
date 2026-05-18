-- ============================================================
--  upgrade_existing.sql — DB đã có, chỉ cập nhật schema (không reset tour)
--
--  SSMS: bật SQLCMD Mode → Execute
--  Không chạy 03_seed_catalog.sql trừ khi muốn xóa hết tour/booking.
-- ============================================================

PRINT N'=== Cập nhật schema (Voucher, Pending, phiên thanh toán) ===';
:r .\02_schema_extensions.sql
GO

PRINT N'=== upgrade_existing.sql hoàn tất. ===';
GO
