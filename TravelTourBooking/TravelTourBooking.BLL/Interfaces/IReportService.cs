using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TravelTourBooking.Common.DTOs;

namespace TravelTourBooking.BLL.Interfaces
{
    public interface IReportService
    {
        Task<IEnumerable<TourRevenueDto>> GetTourRevenueAsync();
        Task<IEnumerable<PopularTourDto>> GetPopularToursAsync();
        Task<IEnumerable<MonthlyRevenueDto>> GetMonthlyRevenueAsync(DateOnly? fromDate, DateOnly? toDate);
        Task<IEnumerable<OccupancyRateDto>> GetOccupancyRatesAsync();
    }
}
