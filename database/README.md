# Database — TravelBookingDB

| Mục đích | File |
|----------|------|
| **Cài mới (khuyến nghị)** | `install.sql` (gồm 3 bước bên trong) |
| Chỉ nâng cấp schema | `upgrade_existing.sql` |
| Reset tour, giữ tài khoản | `03_seed_catalog.sql` (backup trước) |
| Sửa ảnh tour, không xóa booking | `optional_patch_tour_images.sql` |

View, SP, trigger: nằm trong `TravelBookingDB.sql` (bước 1 của `install.sql`).

Hướng dẫn đầy đủ (database + appsettings + chạy project): **[GUID.md](../GUID.md)**.
