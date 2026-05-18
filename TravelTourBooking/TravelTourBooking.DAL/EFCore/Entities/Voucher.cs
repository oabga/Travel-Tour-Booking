using System;

namespace TravelTourBooking.DAL.EFCore.Entities
{
    public class Voucher
    {
        public int VoucherId { get; set; }
        public string Code { get; set; } = null!;
        public decimal DiscountPercent { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int MaxUsage { get; set; } = 100;
        public int UsedCount { get; set; } = 0;
    }
}
