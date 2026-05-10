using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TravelTourBooking.Common.DTOs;

namespace TravelTourBooking.DAL.Repositories.Interfaces
{
    public interface IReportRepository
    {
        /// <summary>Truy vấn vw_TourRevenue — doanh thu theo từng tour</summary>
        Task<IEnumerable<TourRevenueDto>> GetTourRevenueAsync();

        /// <summary>Truy vấn vw_PopularTours — xếp hạng tour theo rating + lượt đặt</summary>
        Task<IEnumerable<PopularTourDto>> GetPopularToursAsync();

        /// <summary>Gọi sp_RevenueReport — doanh thu GROUP BY tháng</summary>
        Task<IEnumerable<MonthlyRevenueDto>> GetMonthlyRevenueAsync(DateOnly? fromDate, DateOnly? toDate);

        /// <summary>Tính Occupancy Rate cho tất cả TourSchedules</summary>
        Task<IEnumerable<OccupancyRateDto>> GetOccupancyRatesAsync();
    }
}
