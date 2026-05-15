using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TravelTourBooking.DAL.EFCore.Entities
{
    public class TourRevenueView
    {
        public int TourId { get; set; }
        public string TourName { get; set; } = string.Empty;
        public string DesName { get; set; } = string.Empty;
        public int? TotalBookings { get; set; }
        public decimal? TotalRevenue { get; set; }
    }
}
