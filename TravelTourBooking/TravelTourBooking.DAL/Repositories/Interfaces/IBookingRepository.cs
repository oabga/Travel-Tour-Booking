using TravelTourBooking.Common.DTOs;
using TravelTourBooking.DAL.EFCore.Entities;

namespace TravelTourBooking.DAL.Repositories.Interfaces;

public interface IBookingRepository : IRepository<Booking>
{
    /// <summary>
    /// Gọi sp_CreateBooking qua ADO.NET — trả về NewBookingId.
    /// </summary>
    Task<int> CreateBookingSpAsync(int accountId, int scheduleId, int numberOfPeople, decimal discountPercent);

    /// <summary>
    /// Gọi sp_CancelBooking qua ADO.NET.
    /// </summary>
    Task CancelBookingSpAsync(int bookingId);

    /// <summary>
    /// Truy vấn vw_BookingDetails qua ADO.NET.
    /// </summary>
    Task<BookingDetailViewDto?> GetBookingDetailViewAsync(int bookingId);

    /// <summary>
    /// Lấy booking kèm BookingDetails (LINQ to Entities).
    /// </summary>
    Task<Booking?> GetWithDetailsAsync(int bookingId);

    /// <summary>
    /// Lịch sử booking của một account (LINQ to Entities).
    /// </summary>
    Task<IEnumerable<BookingHistoryDto>> GetByAccountAsync(int accountId);

    /// <summary>
    /// Thêm danh sách hành khách.
    /// </summary>
    Task AddPassengersAsync(IEnumerable<BookingDetail> details);
}
