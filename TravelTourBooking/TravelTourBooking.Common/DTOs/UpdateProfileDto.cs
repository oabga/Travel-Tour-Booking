namespace TravelTourBooking.Common.DTOs;
public class UpdateProfileDto
{
    public string FullName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Address { get; set; }
}

/// <summary>
/// DTO trả về danh sách khách hàng (dùng cho Staff/Admin xem thông tin tư vấn).
/// </summary>
public class CustomerListDto
{
    public int AccountId { get; set; }
    public string? Email { get; set; }
    public string? FullName { get; set; }
    public string? Phone { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Address { get; set; }
    public DateTime CreatedAt { get; set; }
}