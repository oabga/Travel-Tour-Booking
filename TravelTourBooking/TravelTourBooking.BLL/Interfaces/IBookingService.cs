using TravelTourBooking.Common.DTOs;

namespace TravelTourBooking.BLL.Interfaces;

public interface IBookingService
{
    /// <summary>
    /// Đặt tour — gọi sp_CreateBooking, INSERT BookingDetails.
    /// </summary>
    Task<BookingResponseDto> CreateBookingAsync(CreateBookingRequestDto dto);

    /// <summary>
    /// Hủy booking — gọi sp_CancelBooking.
    /// </summary>
    Task CancelBookingAsync(int bookingId);

    /// <summary>
    /// Chi tiết đơn hàng — truy vấn vw_BookingDetails + danh sách hành khách.
    /// </summary>
    Task<BookingDetailViewDto?> GetBookingDetailAsync(int bookingId);

    /// <summary>
    /// Lịch sử booking của một tài khoản.
    /// </summary>
    Task<IEnumerable<BookingHistoryDto>> GetBookingsByAccountAsync(int accountId);
}
