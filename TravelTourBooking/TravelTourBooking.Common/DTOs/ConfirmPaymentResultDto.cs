namespace TravelTourBooking.Common.DTOs;

public class ConfirmPaymentResultDto
{
    public bool Success { get; set; }
    public bool BookingConfirmed { get; set; }
    public bool EmailSent { get; set; }
    public decimal RemainingAmount { get; set; }
    /// <summary>Equal, Underpaid, Overpaid</summary>
    public string? PaymentMatch { get; set; }
    public string Message { get; set; } = string.Empty;
}

public class RejectPaymentResultDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
}
