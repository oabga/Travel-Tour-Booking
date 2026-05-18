namespace TravelTourBooking.Common.DTOs;

public class CheckoutPaymentResultDto
{
    public int PaymentId { get; set; }
    public bool BookingConfirmed { get; set; }
    public bool EmailSent { get; set; }
    public decimal RemainingAmount { get; set; }
    public string Message { get; set; } = string.Empty;
}
