using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TravelTourBooking.DAL.EFCore.Entities;

[Table("Reviews")]
public class Review
{
    [Key]
    public int ReviewId { get; set; }

    public int? AccountId { get; set; }

    public int? TourId { get; set; }

    [Range(1, 5)]
    public int Rating { get; set; }

    [MaxLength(255)]
    public string? Comment { get; set; }

    public DateTime ReviewDate { get; set; }
        = DateTime.Now;

    [ForeignKey("AccountId")]
    public virtual Account? Account { get; set; }

    [ForeignKey("TourId")]
    public virtual Tour? Tour { get; set; }
}