using TravelTourBooking.Common.DTOs;
namespace TravelTourBooking.BLL.Interfaces;
public interface IReviewService
{
    Task CreateReviewAsync(
        int accountId,
        ReviewDto dto);
    Task<List<ReviewResponseDto>> GetReviewsByTourAsync(int tourId);

    Task<List<ReviewResponseDto>> GetRecentReviewsAsync(int limit = 6);
}