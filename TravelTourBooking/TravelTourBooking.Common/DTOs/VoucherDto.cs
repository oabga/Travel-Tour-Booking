using System;
using System.ComponentModel.DataAnnotations;

namespace TravelTourBooking.Common.DTOs
{
    public class VoucherValidationDto
    {
        public string Code { get; set; } = string.Empty;
        public decimal DiscountPercent { get; set; }
        public string? Message { get; set; }
        public bool IsValid { get; set; }
    }

    public class VoucherDto
    {
        public int VoucherId { get; set; }
        public string Code { get; set; } = string.Empty;
        public decimal DiscountPercent { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int MaxUsage { get; set; }
        public int UsedCount { get; set; }
    }

    public class VoucherCreateUpdateDto
    {
        [Required(ErrorMessage = "Mã giảm giá là bắt buộc.")]
        [MaxLength(50, ErrorMessage = "Mã giảm giá không được quá 50 ký tự.")]
        public string Code { get; set; } = string.Empty;

        [Required(ErrorMessage = "Phần trăm giảm giá là bắt buộc.")]
        [Range(0, 100, ErrorMessage = "Phần trăm giảm giá phải từ 0% đến 100%.")]
        public decimal DiscountPercent { get; set; }

        [Required(ErrorMessage = "Ngày bắt đầu có hiệu lực là bắt buộc.")]
        public DateTime StartDate { get; set; }

        [Required(ErrorMessage = "Ngày hết hạn là bắt buộc.")]
        public DateTime EndDate { get; set; }

        [Required(ErrorMessage = "Lượt sử dụng tối đa là bắt buộc.")]
        [Range(1, 100000, ErrorMessage = "Lượt sử dụng tối đa phải từ 1.")]
        public int MaxUsage { get; set; } = 100;
    }
}
