using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TravelTourBooking.DAL.EFCore.Entities;

[Table("TourSchedules")]
public class TourSchedule
{
    [Key]
    public int ScheduleId { get; set; }

    public int? TourId { get; set; }

    public DateOnly? DepartureDate { get; set; }

    public DateOnly? ReturnDate { get; set; }

    public int AvailableSlots { get; set; }

    public int? EmployeeId { get; set; }

    [MaxLength(50)]
    public string? Status { get; set; } = "Open";

    // Navigation
    [ForeignKey(nameof(TourId))]
    public Tour? Tour { get; set; }

    [ForeignKey(nameof(EmployeeId))]
    public Employee? Employee { get; set; }

    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}