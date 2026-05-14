using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TravelTourBooking.DAL.EFCore.Entities;

[Table("Tours")]
public class Tour
{
    [Key]
    public int TourId { get; set; }

    [MaxLength(150)]
    public string? TourName { get; set; }

    public int? CateId { get; set; }

    public int? DesId { get; set; }

    public int DurationDays { get; set; }

    [Column(TypeName = "decimal(12,2)")]
    public decimal Price { get; set; }

    public int MaxCapacity { get; set; }

    [MaxLength(255)]
    public string? Description { get; set; }

    [MaxLength(255)]
    public string? ImageUrl { get; set; }

    public bool IsActive { get; set; } = true;

    // Navigation
    [ForeignKey(nameof(CateId))]
    public Category? Category { get; set; }

    [ForeignKey(nameof(DesId))]
    public Destination? Destination { get; set; }

    public ICollection<TourSchedule> TourSchedules { get; set; } = new List<TourSchedule>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}