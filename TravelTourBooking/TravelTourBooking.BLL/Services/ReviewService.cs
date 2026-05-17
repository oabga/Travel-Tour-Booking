using Microsoft.EntityFrameworkCore;
using TravelTourBooking.BLL.Interfaces;
using TravelTourBooking.Common.DTOs;
using TravelTourBooking.DAL.EFCore;
using TravelTourBooking.DAL.EFCore.Entities;
namespace TravelTourBooking.BLL.Services;
public class ReviewService : IReviewService
{
    private readonly AppDbContext _context;

    public ReviewService(AppDbContext context)
    {
        _context = context;
    }
    public async Task CreateReviewAsync(
        int accountId,
        ReviewDto dto)
    {
        var hasCompletedBooking =
            await _context.Bookings.AnyAsync(x =>
                x.AccountId == accountId &&
                x.Status == "Completed");

        if (!hasCompletedBooking)
        {
            throw new Exception(
                "Bạn chưa hoàn thành tour này");
        }

        var review = new Review
        {
            AccountId = accountId,
            TourId = dto.TourId,
            Rating = dto.Rating,
            Comment = dto.Comment
        };

        _context.Reviews.Add(review);

        await _context.SaveChangesAsync();
    }

    public async Task<List<ReviewResponseDto>> GetReviewsByTourAsync(int tourId)
    {
        return await _context.Reviews
            .Where(r => r.TourId == tourId)
            .OrderByDescending(r => r.ReviewDate)
            .Select(r => new ReviewResponseDto
            {
                ReviewId = r.ReviewId,
                Rating = r.Rating,
                Comment = r.Comment,
                ReviewDate = r.ReviewDate,
                UserName = _context.CustomerProfiles
                    .Where(cp => cp.AccountId == r.AccountId)
                    .Select(cp => cp.FullName)
                    .FirstOrDefault() ?? "Ẩn danh"
            })
            .ToListAsync();
    }
}