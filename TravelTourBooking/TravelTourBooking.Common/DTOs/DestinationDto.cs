using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TravelTourBooking.Common.DTOs
{
    public class DestinationResponseDto
    {
        public int DesId { get; set; }
        public string? DesName { get; set; }
        public string? Country { get; set; }
        public string? City { get; set; }
        public string? Description { get; set; }
    }

    public class DestinationRequestDto
    {
        [Required(ErrorMessage = "Tên điểm đến không được để trống.")]
        [MaxLength(150)]
        public string DesName { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Country { get; set; }

        [MaxLength(100)]
        public string? City { get; set; }

        [MaxLength(255)]
        public string? Description { get; set; }
    }
}
