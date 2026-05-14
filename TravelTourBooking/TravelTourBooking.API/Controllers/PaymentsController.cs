using Microsoft.AspNetCore.Mvc;
using TravelTourBooking.BLL.Interfaces;
using TravelTourBooking.Common.DTOs;

namespace TravelTourBooking.API.Controllers;

[ApiController]
[Route("api/payments")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _service;

    public PaymentsController(IPaymentService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreatePaymentDto dto)
    {
        var id = await _service.CreatePaymentAsync(dto);

        return Ok(id);
    }

    [HttpGet("booking/{bookingId}")]
    public async Task<IActionResult> GetByBooking(int bookingId)
    {
        var result =
            await _service.GetPaymentsByBookingAsync(bookingId);

        return Ok(result);
    }

    [HttpGet("booking/{bookingId}/total-paid")]
    public async Task<IActionResult> GetTotalPaid(int bookingId)
    {
        var result = await _service.GetTotalPaidAsync(bookingId);
        return Ok(result);
    }

    [HttpGet("booking/{bookingId}/remaining")]
    public async Task<IActionResult> GetRemaining(int bookingId)
    {
        var result = await _service.GetRemainingAmountAsync(bookingId);
        return Ok(result);
    }
}