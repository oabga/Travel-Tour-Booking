namespace TravelTourBooking.Common.DTOs;

public class PaymentDto
{
    public int PaymentId { get; set; }

    public int BookingId { get; set; }

    public decimal Amount { get; set; }

    public DateTime PaymentDate { get; set; }

    public string? PaymentMethod { get; set; }

    public string? Status { get; set; }

    public string? InvoiceCode { get; set; }

    public string? TransactionCode { get; set; }
}