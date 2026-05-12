using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TravelTourBooking.DAL.EFCore.Entities;

[Table("Destinations")]
public class Destination
{
    [Key]
    public int DesId { get; set; }

    [MaxLength(150)]
    public string? DesName { get; set; }

    [MaxLength(100)]
    public string? Country { get; set; }

    [MaxLength(100)]
    public string? City { get; set; }

    [MaxLength(255)]
    public string? Description { get; set; }

    // Navigation
    public ICollection<Tour> Tours { get; set; } = new List<Tour>();
}