using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TravelTourBooking.DAL.EFCore.Entities
{
    public class PopularToursView
    {
        public int TourId { get; set; }
        public string TourName { get; set; } = string.Empty;
        public string DesName { get; set; } = string.Empty;
        public decimal? AvgRating { get; set; }
        public int TotalBookings { get; set; }
    }
}
