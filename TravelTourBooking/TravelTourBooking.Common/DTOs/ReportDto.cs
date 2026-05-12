using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TravelTourBooking.Common.DTOs
{
    public class TourRevenueDto
    {
        public int TourId { get; set; }
        public string TourName { get; set; } = string.Empty;
        public string DesName { get; set; } = string.Empty;
        public int TotalBookings { get; set; }
        public decimal TotalRevenue { get; set; }
    }

    public class MonthlyRevenueDto
    {
        public int RevenueYear { get; set; }
        public int RevenueMonth { get; set; }
        public int TotalBookings { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal AvgOrderValue { get; set; }
    }

    public class PopularTourDto
    {
        public int TourId { get; set; }
        public string TourName { get; set; } = string.Empty;
        public string DesName { get; set; } = string.Empty;
        public double AvgRating { get; set; }
        public int TotalBookings { get; set; }
    }

    public class OccupancyRateDto
    {
        public int ScheduleId { get; set; }
        public int TourId { get; set; }
        public string TourName { get; set; } = string.Empty;
        public DateOnly DepartureDate { get; set; }
        public int TotalSlots { get; set; }
        public int BookedSlots { get; set; }
        public int AvailableSlots { get; set; }
        public decimal OccupancyPercent { get; set; }
    }

    public class RevenueReportQueryDto
    {
        public DateOnly? FromDate { get; set; }
        public DateOnly? ToDate { get; set; }
    }
}
