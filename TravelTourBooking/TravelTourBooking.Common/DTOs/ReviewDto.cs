namespace TravelTourBooking.Common.DTOs;
public class ReviewDto
{
    public int TourId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
}