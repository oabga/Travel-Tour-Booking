using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TravelTourBooking.Common.DTOs
{
    public class SearchTourResult
    {
        public int TourId { get; set; }
        public string? TourName { get; set; }
        public decimal Price { get; set; }
        public int DurationDays { get; set; }
        public int MaxCapacity { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public string? DesName { get; set; }
        public string? Country { get; set; }
        public int ScheduleId { get; set; }
        public DateOnly DepartureDate { get; set; }
        public DateOnly ReturnDate { get; set; }
        public int AvailableSlots { get; set; }
        public string? ScheduleStatus { get; set; }
    }
}
