using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TravelTourBooking.Common.DTOs
{
    public class ScheduleResponseDto
    {
        public int ScheduleId { get; set; }
        public int? TourId { get; set; }
        public DateOnly? DepartureDate { get; set; }
        public DateOnly? ReturnDate { get; set; }
        public int AvailableSlots { get; set; }
        public int? EmployeeId { get; set; }
        public string? EmployeeName { get; set; }
        public string? Status { get; set; }
    }

    public class ScheduleRequestDto
    {
        [Required]
        public int TourId { get; set; }

        [Required]
        public DateOnly DepartureDate { get; set; }

        [Required]
        public DateOnly ReturnDate { get; set; }

        [Range(1, 500, ErrorMessage = "Số chỗ phải từ 1 đến 500.")]
        public int AvailableSlots { get; set; }

        public int? EmployeeId { get; set; }
    }
}
