using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TravelTourBooking.Common.DTOs
{
    public class EmployeeDto
    {
        public int EmployeeId { get; set; }
        public string? FullName { get; set; }
        public string? Role { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }

    }
}
