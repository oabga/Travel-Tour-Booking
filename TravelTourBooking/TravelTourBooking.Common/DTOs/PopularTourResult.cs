using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TravelTourBooking.Common.DTOs
{
    public class PopularTourResult
    {
        public int TourId { get; set; }
        public string? TourName { get; set; }
        public decimal Price { get; set; }
        public int DurationDays { get; set; }
        public string? CateName { get; set; }
        public string? DesName { get; set; }
        public decimal? AvgRating { get; set; }
        public int TotalReviews { get; set; }
        public int BookingCount { get; set; }
    }
}
