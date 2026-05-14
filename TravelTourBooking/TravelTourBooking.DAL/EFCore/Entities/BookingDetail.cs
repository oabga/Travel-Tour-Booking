using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TravelTourBooking.DAL.EFCore.Entities;

[Table("BookingDetails")]
public class BookingDetail
{
    [Key]
    public int DetailId { get; set; }

    public int? BookingId { get; set; }

    [MaxLength(150)]
    public string? PassengerName { get; set; }

    public DateOnly? PassengerDOB { get; set; }

    [MaxLength(20)]
    public string? PassengerPhone { get; set; }

    public bool IsPrimaryContact { get; set; } = false;

    [MaxLength(20)]
    public string PassengerType { get; set; } = "Adult";

    [MaxLength(20)]
    public string? PassengerIdNumber { get; set; }

    // Navigation
    [ForeignKey(nameof(BookingId))]
    public Booking? Booking { get; set; }
}
