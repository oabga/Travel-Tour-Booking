using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TravelTourBooking.DAL.EFCore.Entities;

[Table("Employees")]
public class Employee
{
    [Key]
    public int EmployeeId { get; set; }

    [MaxLength(150)]
    public string? FullName { get; set; }

    [MaxLength(50)]
    public string? Role { get; set; }

    [MaxLength(20)]
    public string? Phone { get; set; }

    [MaxLength(150)]
    public string? Email { get; set; }

    // Navigation
    public ICollection<TourSchedule> TourSchedules { get; set; } = new List<TourSchedule>();
}