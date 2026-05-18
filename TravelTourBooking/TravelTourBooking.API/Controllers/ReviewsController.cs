using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelTourBooking.BLL.Interfaces;
using TravelTourBooking.Common.DTOs;

namespace TravelTourBooking.API.Controllers;

[ApiController]
[Route("api/reviews")]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService _service;

    public ReviewsController(
        IReviewService service)
    {
        _service = service;
    }

    [Authorize(Roles = "Customer")]
    [HttpPost]
    public async Task<IActionResult> Create(
        ReviewDto dto)
    {
        var accountId = int.Parse(
            User.FindFirstValue(
                ClaimTypes.NameIdentifier)!);

        await _service.CreateReviewAsync(
            accountId,
            dto);

        return Ok("Review submitted");
    }

    [AllowAnonymous]
    [HttpGet("tour/{tourId}")]
    public async Task<IActionResult> GetByTour(int tourId)
    {
        var reviews = await _service.GetReviewsByTourAsync(tourId);
        return Ok(reviews);
    }

    [AllowAnonymous]
    [HttpGet("recent")]
    public async Task<IActionResult> GetRecent([FromQuery] int limit = 6)
    {
        if (limit < 1 || limit > 20)
            return BadRequest("limit phải từ 1 đến 20.");
        var reviews = await _service.GetRecentReviewsAsync(limit);
        return Ok(reviews);
    }
}