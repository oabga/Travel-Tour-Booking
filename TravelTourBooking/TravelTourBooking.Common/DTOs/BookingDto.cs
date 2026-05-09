using System.ComponentModel.DataAnnotations;

namespace TravelTourBooking.Common.DTOs;

// ── Request DTOs ──────────────────────────────────────────────────────────

/// <summary>
/// DTO gửi lên khi tạo booking (POST /api/bookings).
/// </summary>
public class CreateBookingRequestDto
{
    [Required(ErrorMessage = "AccountId là bắt buộc.")]
    public int AccountId { get; set; }

    [Required(ErrorMessage = "ScheduleId là bắt buộc.")]
    public int ScheduleId { get; set; }

    [Range(1, 100, ErrorMessage = "Số người phải từ 1 đến 100.")]
    public int NumberOfPeople { get; set; }

    [Range(0, 100, ErrorMessage = "Giảm giá từ 0 đến 100%.")]
    public decimal DiscountPercent { get; set; } = 0;

    [MaxLength(255)]
    public string? Notes { get; set; }

    /// <summary>
    /// Danh sách hành khách — số lượng phải bằng NumberOfPeople.
    /// </summary>
    [Required(ErrorMessage = "Danh sách hành khách là bắt buộc.")]
    [MinLength(1, ErrorMessage = "Cần ít nhất 1 hành khách.")]
    public List<PassengerDto> Passengers { get; set; } = [];
}

/// <summary>
/// Thông tin từng hành khách.
/// </summary>
public class PassengerDto
{
    [Required(ErrorMessage = "Tên hành khách là bắt buộc.")]
    [MaxLength(150)]
    public string PassengerName { get; set; } = string.Empty;

    public DateOnly? PassengerDOB { get; set; }

    [MaxLength(20)]
    public string? PassengerPhone { get; set; }

    public bool IsPrimaryContact { get; set; } = false;

    /// <summary>
    /// "Adult" hoặc "Child".
    /// </summary>
    [Required]
    [RegularExpression("^(Adult|Child)$", ErrorMessage = "PassengerType phải là 'Adult' hoặc 'Child'.")]
    public string PassengerType { get; set; } = "Adult";

    /// <summary>
    /// CCCD (12 chữ số) hoặc số Hộ chiếu.
    /// Bắt buộc với Adult, NULL cho Child.
    /// </summary>
    [MaxLength(20)]
    public string? PassengerIdNumber { get; set; }
}

// ── Response DTOs ─────────────────────────────────────────────────────────

/// <summary>
/// DTO trả về khi tạo booking thành công.
/// </summary>
public class BookingResponseDto
{
    public int BookingId { get; set; }
    public int? AccountId { get; set; }
    public int? ScheduleId { get; set; }
    public DateTime BookingDate { get; set; }
    public int NumberOfPeople { get; set; }
    public decimal? TotalAmount { get; set; }
    public decimal DiscountPercent { get; set; }
    public string? Status { get; set; }
    public string? Notes { get; set; }
    public List<PassengerResponseDto> Passengers { get; set; } = [];
}

/// <summary>
/// Hành khách trong response.
/// </summary>
public class PassengerResponseDto
{
    public int DetailId { get; set; }
    public string? PassengerName { get; set; }
    public DateOnly? PassengerDOB { get; set; }
    public string? PassengerPhone { get; set; }
    public bool IsPrimaryContact { get; set; }
    public string? PassengerType { get; set; }
    public string? PassengerIdNumber { get; set; }
}

/// <summary>
/// Chi tiết đơn hàng — map từ vw_BookingDetails (JOIN 4+ bảng).
/// </summary>
public class BookingDetailViewDto
{
    public int BookingId { get; set; }
    public string? UserName { get; set; }
    public string? UserPhone { get; set; }
    public string? UserEmail { get; set; }
    public string? TourName { get; set; }
    public string? DesName { get; set; }
    public DateTime? DepartureDate { get; set; }
    public DateTime? ReturnDate { get; set; }
    public int NumberOfPeople { get; set; }
    public decimal? TotalAmount { get; set; }
    public decimal DiscountPercent { get; set; }
    public string? BookingStatus { get; set; }
    public DateTime BookingDate { get; set; }
    public string? Notes { get; set; }

    /// <summary>
    /// Danh sách hành khách đi kèm (join thêm từ BookingDetails).
    /// </summary>
    public List<PassengerResponseDto> Passengers { get; set; } = [];
}

/// <summary>
/// Tóm tắt booking trong lịch sử (GET /api/bookings/account/{id}).
/// </summary>
public class BookingHistoryDto
{
    public int BookingId { get; set; }
    public string? TourName { get; set; }
    public string? DesName { get; set; }
    public DateTime? DepartureDate { get; set; }
    public int NumberOfPeople { get; set; }
    public decimal? TotalAmount { get; set; }
    public string? Status { get; set; }
    public DateTime BookingDate { get; set; }
}
