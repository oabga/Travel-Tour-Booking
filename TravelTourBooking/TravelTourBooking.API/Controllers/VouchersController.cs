using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelTourBooking.Common.DTOs;

namespace TravelTourBooking.API.Controllers;

[ApiController]
[Route("api/vouchers")]
public class VouchersController : ControllerBase
{
    private readonly Dictionary<string, decimal> _vouchers = new()
    {
        { "HE2024", 10 },
        { "DHM2024", 20 },
        { "TRAVEL5", 5 },
        { "SUMMER15", 15 }
    };

    [HttpGet("validate/{code}")]
    [Authorize]
    public IActionResult Validate(string code)
    {
        code = code.ToUpper().Trim();
        
        if (_vouchers.TryGetValue(code, out decimal discount))
        {
            return Ok(ApiResponse<VoucherValidationDto>.Ok(new VoucherValidationDto
            {
                Code = code,
                DiscountPercent = discount,
                IsValid = true,
                Message = $"Áp dụng mã {code} thành công! Bạn được giảm {discount}%."
            }));
        }

        return Ok(ApiResponse<VoucherValidationDto>.Fail("Mã giảm giá không hợp lệ hoặc đã hết hạn."));
    }
}
