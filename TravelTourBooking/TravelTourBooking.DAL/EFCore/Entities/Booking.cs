using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TravelTourBooking.DAL.EFCore.Entities;

[Table("Bookings")]
public class Booking
{
    [Key]
    public int BookingId { get; set; }

    public int? AccountId { get; set; }

    public int? ScheduleId { get; set; }

    public DateTime BookingDate { get; set; } = DateTime.Now;

    public int NumberOfPeople { get; set; }

    [Column(TypeName = "decimal(12,2)")]
    public decimal? TotalAmount { get; set; }

    [Column(TypeName = "decimal(5,2)")]
    public decimal DiscountPercent { get; set; } = 0;

    [MaxLength(50)]
    public string Status { get; set; } = "Pending";

    [MaxLength(255)]
    public string? Notes { get; set; }

    // Navigation
    [ForeignKey(nameof(ScheduleId))]
    public TourSchedule? Schedule { get; set; }

 
}