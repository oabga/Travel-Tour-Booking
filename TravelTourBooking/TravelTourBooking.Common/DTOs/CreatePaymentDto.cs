namespace TravelTourBooking.Common.DTOs;

public class CreatePaymentDto
{
    public int BookingId { get; set; }

    public decimal Amount { get; set; }

    public string? PaymentMethod { get; set; }

    public string? Status { get; set; }

    public string? TransactionCode { get; set; }
}