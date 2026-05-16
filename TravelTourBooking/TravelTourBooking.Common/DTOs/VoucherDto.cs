namespace TravelTourBooking.Common.DTOs;

public class VoucherValidationDto
{
    public string Code { get; set; } = string.Empty;
    public decimal DiscountPercent { get; set; }
    public string? Message { get; set; }
    public bool IsValid { get; set; }
}
