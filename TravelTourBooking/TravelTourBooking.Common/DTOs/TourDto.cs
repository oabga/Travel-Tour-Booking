using System.ComponentModel.DataAnnotations;

namespace TravelTourBooking.Common.DTOs
{
    public class TourRequestDto
    {
        [Required(ErrorMessage = "Tên tour không được để trống.")]
        [MaxLength(150)]
        public string TourName { get; set; } = string.Empty;

        [Required]
        public int CateId { get; set; }

        [Required]
        public int DesId { get; set; }

        [Range(1, 30, ErrorMessage = "Số ngày phải từ 1 đến 30.")]
        public int DurationDays { get; set; }

        [Range(1, 999_999_999, ErrorMessage = "Giá phải lớn hơn 0.")]
        public decimal Price { get; set; }

        [Range(1, 500, ErrorMessage = "Sức chứa phải từ 1 đến 500.")]
        public int MaxCapacity { get; set; }

        [MaxLength(255)]
        public string? Description { get; set; }

        [MaxLength(255)]
        public string? ImageUrl { get; set; }
    }

    public class TourListDto
    {
        public int TourId { get; set; }
        public string? TourName { get; set; }
        public decimal Price { get; set; }
        public int DurationDays { get; set; }
        public int MaxCapacity { get; set; }
        public string? ImageUrl { get; set; }
        public string? CateName { get; set; }
        public string? DesName { get; set; }
        public decimal? AvgRating { get; set; }
    }

    public class TourDetailDto
    {
        public int TourId { get; set; }
        public string? TourName { get; set; }
        public decimal Price { get; set; }
        public int DurationDays { get; set; }
        public int MaxCapacity { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public string? CateName { get; set; }
        public string? DesName { get; set; }
        public string? Country { get; set; }
        public string? City { get; set; }
        public decimal? AvgRating { get; set; }
        public int TotalReviews { get; set; }
        public IEnumerable<ScheduleResponseDto> Schedules { get; set; } = [];
    }
}
