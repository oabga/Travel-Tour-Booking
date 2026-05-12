using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TravelTourBooking.Common.DTOs
{
    public class CategoryResponseDto
    {
        public int CateId { get; set; }
        public string CateName { get; set; } = string.Empty;
        public string? Description { get; set; }
    }

    public class CategoryRequestDto
    {
        [Required(ErrorMessage = "Tên danh mục không được để trống.")]
        [MaxLength(100)]
        public string CateName { get; set; } = string.Empty;

        [MaxLength(255)]
        public string? Description { get; set; }
    }
}
