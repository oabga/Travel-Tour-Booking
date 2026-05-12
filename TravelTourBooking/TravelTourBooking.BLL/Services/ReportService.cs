using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TravelTourBooking.BLL.Interfaces;
using TravelTourBooking.Common.DTOs;
using TravelTourBooking.DAL.Repositories.Interfaces;

namespace TravelTourBooking.BLL.Services
{
    public class ReportService : IReportService
    {
        private readonly IReportRepository _reportRepository;

        public ReportService(IReportRepository reportRepository)
        {
            _reportRepository = reportRepository;
        }

        public async Task<IEnumerable<TourRevenueDto>> GetTourRevenueAsync()
        {
            return await _reportRepository.GetTourRevenueAsync();
        }

        public async Task<IEnumerable<PopularTourDto>> GetPopularToursAsync()
        {
            return await _reportRepository.GetPopularToursAsync();
        }

        public async Task<IEnumerable<MonthlyRevenueDto>> GetMonthlyRevenueAsync(
            DateOnly? fromDate, DateOnly? toDate)
        {
            // LINQ to Objects — validate date range trong BLL (không để logic này xuống DAL)
            if (fromDate.HasValue && toDate.HasValue && fromDate > toDate)
                throw new ArgumentException("FromDate không được lớn hơn ToDate.");

            // Không cho phép khoảng thời gian quá 5 năm
            if (fromDate.HasValue && toDate.HasValue)
            {
                var diffYears = toDate.Value.Year - fromDate.Value.Year;
                if (diffYears > 5)
                    throw new ArgumentException("Khoảng thời gian báo cáo không được vượt quá 5 năm.");
            }

            var data = await _reportRepository.GetMonthlyRevenueAsync(fromDate, toDate);

            // LINQ to Objects — bổ sung tổng cộng (summary) vào cuối nếu cần
            return data.ToList();
        }

        public async Task<IEnumerable<OccupancyRateDto>> GetOccupancyRatesAsync()
        {
            var data = await _reportRepository.GetOccupancyRatesAsync();

            // LINQ to Objects — chỉ trả về lịch chưa qua (còn hạn booking)
            return data
                .Where(o => o.DepartureDate >= DateOnly.FromDateTime(DateTime.Today))
                .OrderByDescending(o => o.OccupancyPercent)
                .ToList();
        }
    }
}
