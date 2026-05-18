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

    public PaymentsController(IPaymentService service) => _service = service;

    /// <summary>Cấu hình hiển thị QR MoMo, STK ngân hàng (public).</summary>
    [HttpGet("config")]
    [AllowAnonymous]
    public IActionResult GetConfig() => Ok(_service.GetPaymentConfig());

    /// <summary>Khách báo đã chuyển MoMo/CK — chờ admin xác nhận.</summary>
    [HttpPost("submit")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> Submit(CreatePaymentDto dto)
    {
        var result = await _service.SubmitCustomerPaymentAsync(dto);
        return Ok(result);
    }

    [HttpPost("checkout")]
    [Authorize(Roles = "Customer")]
    [Obsolete("Dùng POST /api/payments/submit")]
    public async Task<IActionResult> Checkout(CreatePaymentDto dto)
    {
        var result = await _service.SubmitCustomerPaymentAsync(dto);
        return Ok(new CheckoutPaymentResultDto
        {
            PaymentId = result.PaymentId,
            EmailSent = result.EmailSent,
            Message = result.Message,
            RemainingAmount = await _service.GetRemainingAmountAsync(dto.BookingId)
        });
    }

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
    public async Task<IActionResult> Confirm(int id, [FromBody] ConfirmPaymentRequestDto body)
    {
        if (body is null || body.VerifiedAmount <= 0)
            return BadRequest(new { message = "Vui lòng nhập số tiền thực nhận (verifiedAmount)." });

        var result = await _service.ConfirmPaymentAsync(id, body.VerifiedAmount);
        return Ok(result);
    }

    [HttpPut("{id}/reject")]
    [Authorize(Roles = "Staff,Admin")]
    public async Task<IActionResult> Reject(int id)
    {
        var result = await _service.RejectPaymentAsync(id);
        return Ok(result);
    }

    [HttpGet("booking/{bookingId}")]
    [Authorize]
    public async Task<IActionResult> GetByBooking(int bookingId) =>
        Ok(await _service.GetPaymentsByBookingAsync(bookingId));

    [HttpGet("booking/{bookingId}/total-paid")]
    [Authorize]
    public async Task<IActionResult> GetTotalPaid(int bookingId) =>
        Ok(await _service.GetTotalPaidAsync(bookingId));

    [HttpGet("booking/{bookingId}/remaining")]
    [Authorize]
    public async Task<IActionResult> GetRemaining(int bookingId) =>
        Ok(await _service.GetRemainingAmountAsync(bookingId));
}
