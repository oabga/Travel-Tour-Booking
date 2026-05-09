using TravelTourBooking.Common.DTOs;
namespace TravelTourBooking.BLL.Interfaces;
public interface IReviewService
{
    Task CreateReviewAsync(
        int accountId,
        ReviewDto dto);
}