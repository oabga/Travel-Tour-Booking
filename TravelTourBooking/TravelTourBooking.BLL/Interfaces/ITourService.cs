using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TravelTourBooking.Common.DTOs;

namespace TravelTourBooking.BLL.Interfaces
{
    public interface ITourService
    {
        // ── Public endpoints ────────
        Task<PagedResult<TourListDto>> GetToursAsync(
            int page, int pageSize,
            int? cateId, int? desId,
            decimal? priceMin, decimal? priceMax);

        Task<TourDetailDto?> GetTourDetailAsync(int tourId);

        Task<IEnumerable<SearchTourResult>> SearchToursAsync(
            string? destination, decimal? priceMin, decimal? priceMax, DateOnly? date);

        Task<IEnumerable<PopularTourResult>> GetPopularToursAsync();

        // ── Admin endpoints ─────────
        Task<TourDetailDto> CreateTourAsync(TourRequestDto dto);
        Task<TourDetailDto> UpdateTourAsync(int tourId, TourRequestDto dto);
        Task DeleteTourAsync(int tourId);
    }
}
