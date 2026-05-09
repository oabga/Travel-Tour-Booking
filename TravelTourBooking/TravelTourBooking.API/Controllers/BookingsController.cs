using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelTourBooking.BLL.Interfaces;
using TravelTourBooking.Common.DTOs;

namespace TravelTourBooking.API.Controllers;

[ApiController]
[Route("api/bookings")]
[Produces("application/json")]
public class BookingsController(IBookingService svc) : ControllerBase
{
    /// <summary>
    /// POST /api/bookings — Đặt tour → gọi sp_CreateBooking + INSERT BookingDetails.
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Customer")]
    [ProducesResponseType(typeof(ApiResponse<BookingResponseDto>), 201)]
    [ProducesResponseType(typeof(ApiResponse<string>), 400)]
    [ProducesResponseType(typeof(ApiResponse<string>), 409)]
    public async Task<IActionResult> Create([FromBody] CreateBookingRequestDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse<string>.Fail("Dữ liệu không hợp lệ."));

        var result = await svc.CreateBookingAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.BookingId },
            ApiResponse<BookingResponseDto>.Ok(result, "Đặt tour thành công."));
    }

    /// <summary>
    /// GET /api/bookings/{id} — Chi tiết booking (vw_BookingDetails + danh sách hành khách).
    /// </summary>
    [HttpGet("{id:int}")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<BookingDetailViewDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse<string>), 404)]
    public async Task<IActionResult> GetById(int id)
    {
        var detail = await svc.GetBookingDetailAsync(id);
        if (detail is null)
            return NotFound(ApiResponse<string>.Fail($"Booking ID {id} không tồn tại."));

        return Ok(ApiResponse<BookingDetailViewDto>.Ok(detail));
    }

    /// <summary>
    /// PUT /api/bookings/{id}/cancel — Hủy booking → gọi sp_CancelBooking.
    /// </summary>
    [HttpPut("{id:int}/cancel")]
    [Authorize(Roles = "Customer")]
    [ProducesResponseType(typeof(ApiResponse<string>), 200)]
    [ProducesResponseType(typeof(ApiResponse<string>), 404)]
    [ProducesResponseType(typeof(ApiResponse<string>), 409)]
    public async Task<IActionResult> Cancel(int id)
    {
        await svc.CancelBookingAsync(id);
        return Ok(ApiResponse<string>.Ok("cancelled", "Hủy booking thành công."));
    }

    /// <summary>
    /// GET /api/bookings/account/{id} — Lịch sử booking của một tài khoản.
    /// </summary>
    [HttpGet("account/{id:int}")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<BookingHistoryDto>>), 200)]
    public async Task<IActionResult> GetByAccount(int id)
    {
        var history = await svc.GetBookingsByAccountAsync(id);
        return Ok(ApiResponse<IEnumerable<BookingHistoryDto>>.Ok(history));
    }
}
