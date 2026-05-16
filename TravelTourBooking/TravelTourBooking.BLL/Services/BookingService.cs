using TravelTourBooking.BLL.Interfaces;
using TravelTourBooking.Common.DTOs;
using TravelTourBooking.DAL.EFCore.Entities;
using TravelTourBooking.DAL.Repositories.Interfaces;

namespace TravelTourBooking.BLL.Services;

public class BookingService(IBookingRepository bookingRepo) : IBookingService
{
    // ── Đặt Tour ───────────────────────────────────────────────────────────
    public async Task<BookingResponseDto> CreateBookingAsync(CreateBookingRequestDto dto)
    {
        // ── Business validation (LINQ to Objects) ──────────────────────────
        if (dto.Passengers.Count != dto.NumberOfPeople)
            throw new ArgumentException(
                $"Số hành khách ({dto.Passengers.Count}) không khớp NumberOfPeople ({dto.NumberOfPeople}).");

        // Kiểm tra: Adult phải có PassengerIdNumber
        var adultsWithoutId = dto.Passengers
            .Where(p => p.PassengerType == "Adult" && string.IsNullOrWhiteSpace(p.PassengerIdNumber))
            .ToList();

        if (adultsWithoutId.Any())
            throw new ArgumentException(
                $"Hành khách người lớn ({string.Join(", ", adultsWithoutId.Select(p => p.PassengerName))}) " +
                "phải có CCCD/Hộ chiếu (PassengerIdNumber).");

        // Kiểm tra ít nhất 1 PrimaryContact
        if (!dto.Passengers.Any(p => p.IsPrimaryContact))
            throw new ArgumentException("Phải có ít nhất 1 hành khách là liên hệ chính (IsPrimaryContact).");

        // ── Gọi SP để tạo booking (Transaction + Trigger trong SQL) ───────
        int newBookingId = await bookingRepo.CreateBookingSpAsync(
            dto.AccountId, dto.ScheduleId, dto.NumberOfPeople, dto.DiscountPercent);

        // ── Cập nhật Notes nếu có ─────────────────────────────────────────
        if (!string.IsNullOrWhiteSpace(dto.Notes))
        {
            var booking = await bookingRepo.GetByIdAsync(newBookingId);
            if (booking is not null)
            {
                booking.Notes = dto.Notes;
                await bookingRepo.UpdateAsync(booking);
            }
        }

        // ── Thêm danh sách hành khách (BookingDetails) ────────────────────
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

        // ── Trả về response ───────────────────────────────────────────────
        var created = await bookingRepo.GetWithDetailsAsync(newBookingId);
        if (created is null)
            throw new InvalidOperationException("Đã tạo booking nhưng không thể đọc lại.");

        return MapToResponse(created);
    }

    // ── Hủy Booking ────────────────────────────────────────────────────────
    public async Task CancelBookingAsync(int bookingId)
    {
        // sp_CancelBooking tự kiểm tra status và THROW nếu lỗi
        await bookingRepo.CancelBookingSpAsync(bookingId);
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
