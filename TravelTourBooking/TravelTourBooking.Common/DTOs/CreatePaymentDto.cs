namespace TravelTourBooking.Common.DTOs;

public class CreatePaymentDto
{
    public int BookingId { get; set; }

    /// <summary>Không bắt buộc — server tự lấy số còn phải trả khi khách submit MoMo.</summary>
    public decimal? Amount { get; set; }

    public string? PaymentMethod { get; set; }


    public string? TransactionCode { get; set; }
}