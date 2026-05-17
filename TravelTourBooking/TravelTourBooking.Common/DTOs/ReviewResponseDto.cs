namespace TravelTourBooking.Common.DTOs;
public class ReviewResponseDto
{
    public int ReviewId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime ReviewDate { get; set; }
    public string UserName { get; set; } = string.Empty;
}
