using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TravelTourBooking.DAL.EFCore.Entities;
using TravelTourBooking.Common.DTOs;
namespace TravelTourBooking.DAL.Repositories.Interfaces
{
    public interface ITourRepository : IRepository<Tour>
    {
        Task<(IEnumerable<Tour> Items, int TotalCount)> GetPagedAsync(
            int page, int pageSize,
            int? cateId, int? desId, int? durationDays,
            decimal? priceMin, decimal? priceMax);

        Task<Tour?> GetDetailAsync(int tourId);

        Task<IEnumerable<SearchTourResult>> SearchAsync(
            string? destination, decimal? priceMin, decimal? priceMax, DateOnly? date);

        Task<IEnumerable<PopularTourResult>> GetPopularAsync();

        Task<IReadOnlyList<int>> GetDistinctDurationDaysAsync();
    }
}
