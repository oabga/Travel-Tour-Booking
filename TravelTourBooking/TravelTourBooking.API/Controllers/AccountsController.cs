using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelTourBooking.BLL.Interfaces;
using TravelTourBooking.Common.DTOs;

namespace TravelTourBooking.API.Controllers;

[ApiController]
[Route("api/accounts")]
public class AccountsController : ControllerBase
{
    private readonly IAccountService _service;

    public AccountsController(IAccountService service)
    {
        _service = service;
    }

    [Authorize]
    [HttpGet("{id}/profile")]
    public async Task<IActionResult> GetProfile(int id)
    {
        var result = await _service.GetProfileAsync(id);

        return Ok(result);
    }

    [Authorize]
    [HttpPut("{id}/profile")]
    public async Task<IActionResult> UpdateProfile(
        int id,
        [FromBody] UpdateProfileDto dto)
    {
        var result =
            await _service.UpdateProfileAsync(id, dto);

        return Ok(result);
    }

    [Authorize]
    [HttpGet("{id}/booking-count")]
    public async Task<IActionResult> GetBookingCount(int id, [FromQuery] int year)
    {
        var total = await _service.GetBookingCountAsync(id, year);
        return Ok(new { accountId = id, year, bookingCount = total });
    }

    /// <summary>
    /// GET /api/accounts/customers — Danh sách khách hàng (Admin và Staff xem để tư vấn).
    /// </summary>
    [Authorize(Roles = "Admin,Staff")]
    [HttpGet("customers")]
    public async Task<IActionResult> GetAllCustomers()
    {
        var customers = await _service.GetAllCustomersAsync();
        return Ok(ApiResponse<IEnumerable<CustomerListDto>>.Ok(customers));
    }
}
