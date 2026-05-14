using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TravelTourBooking.DAL.EFCore.Entities;

[Table("Categories")]
public class Category
{
    [Key]
    public int CateId { get; set; }

    [Required, MaxLength(100)]
    public string CateName { get; set; } = string.Empty;

    [MaxLength(255)]
    public string? Description { get; set; }

    // Navigation
    public ICollection<Tour> Tours { get; set; } = new List<Tour>();
}