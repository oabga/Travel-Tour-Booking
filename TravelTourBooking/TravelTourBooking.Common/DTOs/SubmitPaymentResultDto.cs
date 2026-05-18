namespace TravelTourBooking.Common.DTOs;

public class SubmitPaymentResultDto
{
    public int PaymentId { get; set; }
    public string Status { get; set; } = "Pending";
    public bool EmailSent { get; set; }
    public string? EmailError { get; set; }
    public string Message { get; set; } = string.Empty;
}
