using Microsoft.AspNetCore.Authorization;
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

    //[HttpPost]
    //public async Task<IActionResult> Create(CreatePaymentDto dto)
    //{
    //    var id = await _service.CreatePaymentAsync(dto);

    //    return Ok(id);
    //}
    [HttpPost("bank-transfer")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> CreateBankTransfer(CreatePaymentDto dto)
    {
        var id = await _service.CreateBankTransferAsync(dto);
        return Ok(id);
    }


    [HttpPost("cash")]
    [Authorize(Roles = "Staff")]
    public async Task<IActionResult> CreateCash(CreateCashPaymentDto dto)
    {
        var id = await _service.CreateCashPaymentAsync(dto);
        return Ok(id);
    }

    [HttpPut("{id}/confirm")]
    [Authorize(Roles = "Staff,Admin")]
    public async Task<IActionResult> Confirm(int id)
    {
        var result = await _service.ConfirmPaymentAsync(id);
        return Ok(result);
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