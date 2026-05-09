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
}