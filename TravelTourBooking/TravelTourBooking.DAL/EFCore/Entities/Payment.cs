using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TravelTourBooking.DAL.EFCore.Entities;

[Table("Payments")]
public class Payment
{
    [Key]
    public int PaymentId { get; set; }

    public int BookingId { get; set; }

    [Column(TypeName = "decimal(12,2)")]
    public decimal Amount { get; set; }

    public DateTime PaymentDate { get; set; }

    [MaxLength(50)]
    public string? PaymentMethod { get; set; }

    [MaxLength(50)]
    public string? Status { get; set; }

    [MaxLength(50)]
    public string? InvoiceCode { get; set; }

    [MaxLength(100)]
    public string? TransactionCode { get; set; }

    [ForeignKey(nameof(BookingId))]
    public Booking? Booking { get; set; }
}