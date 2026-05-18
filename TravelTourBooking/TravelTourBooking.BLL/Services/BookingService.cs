using TravelTourBooking.BLL.Interfaces;
using TravelTourBooking.Common.DTOs;
using TravelTourBooking.DAL.EFCore.Entities;
using TravelTourBooking.DAL.Repositories.Interfaces;
using TravelTourBooking.DAL.EFCore;
using Microsoft.EntityFrameworkCore;

namespace TravelTourBooking.BLL.Services;

public class BookingService(IBookingRepository bookingRepo, AppDbContext dbContext) : IBookingService
{
    private const int PaymentSessionMinutes = 2;

    private static readonly string[] BlockingPaymentStatuses = ["Pending", "Completed"];
    // ── Đặt Tour ───────────────────────────────────────────────────────────
    public async Task<BookingResponseDto> CreateBookingAsync(CreateBookingRequestDto dto)
    {
        // Business validation
        if (dto.Passengers.Count != dto.NumberOfPeople)
            throw new ArgumentException(
                $"Số hành khách ({dto.Passengers.Count}) không khớp NumberOfPeople ({dto.NumberOfPeople}).");

        var adultsWithoutId = dto.Passengers
            .Where(p => p.PassengerType == "Adult" && string.IsNullOrWhiteSpace(p.PassengerIdNumber))
            .ToList();

        if (adultsWithoutId.Any())
            throw new ArgumentException(
                $"Hành khách người lớn ({string.Join(", ", adultsWithoutId.Select(p => p.PassengerName))}) " +
                "phải có CCCD/Hộ chiếu (PassengerIdNumber).");

        var primaryContacts = dto.Passengers.Where(p => p.IsPrimaryContact).ToList();
        if (primaryContacts.Count == 0)
            throw new ArgumentException("Phải có ít nhất 1 hành khách là liên hệ chính (IsPrimaryContact).");
        if (primaryContacts.Count > 1)
            throw new ArgumentException("Chỉ được phép chọn duy nhất 1 hành khách là liên hệ chính.");

        var primaryContact = primaryContacts[0];
        if (string.IsNullOrWhiteSpace(primaryContact.PassengerPhone))
            throw new ArgumentException($"Hành khách liên hệ chính ({primaryContact.PassengerName}) phải nhập số điện thoại để liên lạc.");

        if (primaryContact.PassengerType != "Adult")
            throw new ArgumentException("Người liên hệ chính (IsPrimaryContact) bắt buộc phải là người lớn (Adult).");

        var hasAdult = dto.Passengers.Any(p => p.PassengerType == "Adult");
        if (!hasAdult)
            throw new ArgumentException("Đoàn hành khách đặt tour bắt buộc phải có ít nhất một người lớn (Adult) đi kèm.");

        var today = DateOnly.FromDateTime(DateTime.Today);
        foreach (var p in dto.Passengers)
        {
            if (p.PassengerDOB == null)
            {
                throw new ArgumentException($"Hành khách '{p.PassengerName}' bắt buộc phải nhập Ngày sinh.");
            }

            var dob = p.PassengerDOB.Value;
            if (dob > today)
            {
                throw new ArgumentException($"Ngày sinh của hành khách '{p.PassengerName}' không được nằm ở tương lai.");
            }

            int age = today.Year - dob.Year;
            if (dob > today.AddYears(-age)) age--;

            if (p.PassengerType == "Child" && age >= 12)
            {
                throw new ArgumentException($"Hành khách '{p.PassengerName}' được chọn là Trẻ em nhưng ngày sinh ({dob:dd/MM/yyyy}) thể hiện đã {age} tuổi. Trẻ em phải dưới 12 tuổi.");
            }

            if (p.PassengerType == "Adult" && age < 12)
            {
                throw new ArgumentException($"Hành khách '{p.PassengerName}' được chọn là Người lớn nhưng ngày sinh ({dob:dd/MM/yyyy}) thể hiện mới {age} tuổi. Người lớn phải từ 12 tuổi trở lên.");
            }
        }

        // Kiểm thử Voucher nếu có gửi kèm mã giảm giá
        Voucher? voucher = null;
        if (!string.IsNullOrWhiteSpace(dto.VoucherCode))
        {
            var codeUpper = dto.VoucherCode.Trim().ToUpper();
            voucher = await dbContext.Vouchers
                .FirstOrDefaultAsync(v => v.Code == codeUpper);

            if (voucher == null)
                throw new ArgumentException("Mã giảm giá không tồn tại trong hệ thống.");

            var now = DateTime.Now;
            if (now < voucher.StartDate || now > voucher.EndDate)
                throw new ArgumentException("Mã giảm giá đã hết hạn hoặc chưa đến ngày có hiệu lực.");

            if (voucher.UsedCount >= voucher.MaxUsage)
                throw new ArgumentException("Mã giảm giá đã đạt số lượt sử dụng tối đa.");

            // Ghi đè discountPercent bằng giá trị thực tế trong DB của Voucher để tránh gian lận
            dto.DiscountPercent = voucher.DiscountPercent;
        }

        // Gọi SP để tạo booking
        int newBookingId = await bookingRepo.CreateBookingSpAsync(
            dto.AccountId, dto.ScheduleId, dto.NumberOfPeople, dto.DiscountPercent);

        // Tăng UsedCount của Voucher
        if (voucher != null)
        {
            voucher.UsedCount++;
            dbContext.Vouchers.Update(voucher);
            await dbContext.SaveChangesAsync();
        }

        // Cập nhật Notes
        if (!string.IsNullOrWhiteSpace(dto.Notes))
        {
            var booking = await bookingRepo.GetByIdAsync(newBookingId);
            if (booking is not null)
            {
                booking.Notes = dto.Notes;
                await bookingRepo.UpdateAsync(booking);
            }
        }

        // Thêm danh sách hành khách
        var details = dto.Passengers.Select(p => new BookingDetail
        {
            BookingId = newBookingId,
            PassengerName = p.PassengerName,
            PassengerDOB = p.PassengerDOB,
            PassengerPhone = p.PassengerPhone,
            IsPrimaryContact = p.IsPrimaryContact,
            PassengerType = p.PassengerType,
            PassengerIdNumber = p.PassengerType == "Child" ? null : p.PassengerIdNumber
        }).ToList();

        await bookingRepo.AddPassengersAsync(details);

        // Đảm bảo chờ thanh toán (SP mới dùng Pending; SP cũ có thể vẫn ghi Confirmed)
        var pendingBooking = await bookingRepo.GetByIdAsync(newBookingId);
        if (pendingBooking is not null
            && pendingBooking.Status != "Cancelled"
            && pendingBooking.Status != "Pending")
        {
            pendingBooking.Status = "Pending";
            await bookingRepo.UpdateAsync(pendingBooking);
        }

        // Trả về response
        var created = await bookingRepo.GetWithDetailsAsync(newBookingId);
        if (created is null)
            throw new InvalidOperationException("Đã tạo booking nhưng không thể đọc lại.");

        return MapToResponse(created);
    }

    // ── Hủy Booking ────────────────────────────────────────────────────────
    public async Task CancelBookingAsync(int bookingId)
    {
        if (await HasBlockingPaymentAsync(bookingId))
            throw new InvalidOperationException(
                "Không thể hủy booking đã có thanh toán chờ xác minh hoặc đã thanh toán. Hãy từ chối/xác nhận giao dịch thay vì hủy.");

        await bookingRepo.CancelBookingSpAsync(bookingId);
    }

    public async Task<PaymentSessionDto> StartPaymentSessionAsync(int bookingId)
    {
        var booking = await bookingRepo.GetByIdAsync(bookingId)
            ?? throw new KeyNotFoundException("Booking not found");

        if (booking.Status == "Cancelled")
            return new PaymentSessionDto
            {
                BookingId = bookingId,
                Expired = true,
                Cancelled = true,
                Message = "Booking đã bị hủy."
            };

        if (booking.Status is not "Pending")
            throw new InvalidOperationException("Chỉ booking chờ thanh toán mới mở phiên thanh toán.");

        if (await HasBlockingPaymentAsync(bookingId))
        {
            var due = await GetAmountDueAsync(bookingId);
            return new PaymentSessionDto
            {
                BookingId = bookingId,
                AmountDue = due,
                RemainingSeconds = 0,
                Message = "Đã gửi thông tin thanh toán. Đang chờ xác minh."
            };
        }

        if (booking.PaymentSessionStartedAt is null)
        {
            var now = DateTime.Now;
            booking.PaymentSessionStartedAt = now;
            booking.PaymentDeadlineAt = now.AddMinutes(PaymentSessionMinutes);
            await bookingRepo.UpdateAsync(booking);
        }

        if (booking.PaymentDeadlineAt.HasValue && DateTime.Now > booking.PaymentDeadlineAt.Value)
        {
            var expired = await TryExpirePendingPaymentSessionAsync(bookingId);
            return expired;
        }

        var remainingSec = booking.PaymentDeadlineAt.HasValue
            ? Math.Max(0, (int)(booking.PaymentDeadlineAt.Value - DateTime.Now).TotalSeconds)
            : PaymentSessionMinutes * 60;

        return new PaymentSessionDto
        {
            BookingId = bookingId,
            DeadlineUtc = booking.PaymentDeadlineAt,
            RemainingSeconds = remainingSec,
            AmountDue = await GetAmountDueAsync(bookingId),
            Message = "Quét QR và gửi mã giao dịch trong thời gian quy định."
        };
    }

    public async Task<ExpirePaymentSessionResultDto> ExpirePaymentSessionAsync(int bookingId)
    {
        var result = await TryExpirePendingPaymentSessionAsync(bookingId);
        return new ExpirePaymentSessionResultDto
        {
            Expired = result.Expired,
            Cancelled = result.Cancelled,
            Message = result.Message
        };
    }

    private async Task<PaymentSessionDto> TryExpirePendingPaymentSessionAsync(int bookingId)
    {
        var booking = await bookingRepo.GetByIdAsync(bookingId);
        if (booking is null)
            return new PaymentSessionDto { BookingId = bookingId, Message = "Booking not found" };

        if (booking.Status != "Pending" || await HasBlockingPaymentAsync(bookingId))
            return new PaymentSessionDto
            {
                BookingId = bookingId,
                Expired = false,
                Cancelled = false,
                AmountDue = await GetAmountDueAsync(bookingId)
            };

        if (!booking.PaymentDeadlineAt.HasValue || DateTime.Now <= booking.PaymentDeadlineAt.Value)
            return new PaymentSessionDto
            {
                BookingId = bookingId,
                Expired = false,
                RemainingSeconds = booking.PaymentDeadlineAt.HasValue
                    ? (int)(booking.PaymentDeadlineAt.Value - DateTime.Now).TotalSeconds
                    : 0,
                AmountDue = await GetAmountDueAsync(bookingId)
            };

        await bookingRepo.CancelBookingSpAsync(bookingId);
        return new PaymentSessionDto
        {
            BookingId = bookingId,
            Expired = true,
            Cancelled = true,
            RemainingSeconds = 0,
            Message = "Đã hết thời gian thanh toán. Chỗ đã được trả cho khách khác."
        };
    }

    private async Task<bool> HasBlockingPaymentAsync(int bookingId) =>
        await dbContext.Payments.AnyAsync(p =>
            p.BookingId == bookingId && BlockingPaymentStatuses.Contains(p.Status));

    private async Task<decimal> GetAmountDueAsync(int bookingId)
    {
        var booking = await bookingRepo.GetByIdAsync(bookingId);
        if (booking?.TotalAmount is null) return 0;

        var paid = await dbContext.Payments
            .Where(p => p.BookingId == bookingId && p.Status == "Completed")
            .SumAsync(p => (decimal?)p.Amount) ?? 0;

        return Math.Max(0, booking.TotalAmount.Value - paid);
    }

    // ── Chi tiết Đơn hàng (vw_BookingDetails) ──────────────────────────────
    public async Task<BookingDetailViewDto?> GetBookingDetailAsync(int bookingId)
    {
        return await bookingRepo.GetBookingDetailViewAsync(bookingId);
    }

    // ── Lịch sử Booking theo Account ───────────────────────────────────────
    public async Task<IEnumerable<BookingHistoryDto>> GetBookingsByAccountAsync(int accountId)
    {
        return await bookingRepo.GetByAccountAsync(accountId);
    }

    // ── Private mapper (LINQ to Objects) ───────────────────────────────────
    private static BookingResponseDto MapToResponse(Booking booking)
    {
        return new BookingResponseDto
        {
            BookingId = booking.BookingId,
            AccountId = booking.AccountId,
            ScheduleId = booking.ScheduleId,
            BookingDate = booking.BookingDate,
            NumberOfPeople = booking.NumberOfPeople,
            TotalAmount = booking.TotalAmount,
            DiscountPercent = booking.DiscountPercent,
            Status = booking.Status,
            Notes = booking.Notes,
            Passengers = booking.BookingDetails.Select(d => new PassengerResponseDto
            {
                DetailId = d.DetailId,
                PassengerName = d.PassengerName,
                PassengerDOB = d.PassengerDOB,
                PassengerPhone = d.PassengerPhone,
                IsPrimaryContact = d.IsPrimaryContact,
                PassengerType = d.PassengerType,
                PassengerIdNumber = d.PassengerIdNumber
            }).ToList()
        };
    }

    public async Task<IEnumerable<BookingHistoryDto>> GetAllBookingsAsync()
    {
        return await bookingRepo.GetAllBookingHistoryAsync();
    }
}
