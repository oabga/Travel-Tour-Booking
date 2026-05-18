namespace TravelTourBooking.Common.DTOs;

public class PaymentSessionDto
{
    public int BookingId { get; set; }
    public DateTime? DeadlineUtc { get; set; }
    public int RemainingSeconds { get; set; }
    public decimal AmountDue { get; set; }
    public bool Expired { get; set; }
    public bool Cancelled { get; set; }
    public string? Message { get; set; }
}

public class ExpirePaymentSessionResultDto
{
    public bool Expired { get; set; }
    public bool Cancelled { get; set; }
    public string? Message { get; set; }
}
