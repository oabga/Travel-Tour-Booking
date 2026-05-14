using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using TravelTourBooking.Common.DTOs;
using TravelTourBooking.DAL.EFCore;
using TravelTourBooking.DAL.Repositories.Interfaces;

namespace TravelTourBooking.DAL.Repositories;

public class ReportRepository : IReportRepository
{
    private readonly AppDbContext _context;

    public ReportRepository(AppDbContext context)
    {
        _context = context;
    }

    // ─── LINQ to Entities — truy vấn vw_TourRevenue ───────────────────────────
    public async Task<IEnumerable<TourRevenueDto>> GetTourRevenueAsync()
    {
        // View đã được map vào DbSet<TourRevenueView> trong AppDbContext
        return await _context.TourRevenueView
            .AsNoTracking()
            .OrderByDescending(v => v.TotalRevenue)
            .Select(v => new TourRevenueDto
            {
                TourId = v.TourId,
                TourName = v.TourName,
                DesName = v.DesName,
                TotalBookings = v.TotalBookings,
                TotalRevenue = v.TotalRevenue
            })
            .ToListAsync();
    }

    // ─── LINQ to Entities — truy vấn vw_PopularTours ──────────────────────────
    public async Task<IEnumerable<PopularTourDto>> GetPopularToursAsync()
    {
        return await _context.PopularToursView
            .AsNoTracking()
            .OrderByDescending(v => v.AvgRating)
            .ThenByDescending(v => v.TotalBookings)
            .Select(v => new PopularTourDto
            {
                TourId = v.TourId,
                TourName = v.TourName,
                DesName = v.DesName,
                AvgRating = v.AvgRating,
                TotalBookings = v.TotalBookings
            })
            .ToListAsync();
    }

    // ─── ADO.NET Connected — gọi sp_RevenueReport ─────────────────────────────
    public async Task<IEnumerable<MonthlyRevenueDto>> GetMonthlyRevenueAsync(
        DateOnly? fromDate, DateOnly? toDate)
    {
        var result = new List<MonthlyRevenueDto>();

        var connectionString = _context.Database.GetConnectionString()!;
        await using var conn = new SqlConnection(connectionString);
        await using var cmd = new SqlCommand("sp_RevenueReport", conn)
        {
            CommandType = System.Data.CommandType.StoredProcedure
        };

        cmd.Parameters.AddWithValue("@FromDate",
            fromDate.HasValue ? (object)fromDate.Value.ToDateTime(TimeOnly.MinValue) : DBNull.Value);
        cmd.Parameters.AddWithValue("@ToDate",
            toDate.HasValue ? (object)toDate.Value.ToDateTime(TimeOnly.MinValue) : DBNull.Value);

        await conn.OpenAsync();
        await using var reader = await cmd.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            result.Add(new MonthlyRevenueDto
            {
                RevenueYear = reader.GetInt32(reader.GetOrdinal("RevenueYear")),
                RevenueMonth = reader.GetInt32(reader.GetOrdinal("RevenueMonth")),
                TotalBookings = reader.GetInt32(reader.GetOrdinal("TotalBookings")),
                TotalRevenue = reader.GetDecimal(reader.GetOrdinal("TotalRevenue")),
                AvgOrderValue = reader.GetDecimal(reader.GetOrdinal("AvgOrderValue"))
            });
        }

        return result;
    }

    // ─── LINQ to Entities — tính Occupancy Rate ───────────────────────────────
    public async Task<IEnumerable<OccupancyRateDto>> GetOccupancyRatesAsync()
    {
        return await _context.TourSchedules
        .AsNoTracking()
        .Include(s => s.Tour)
        .Where(s => s.TotalSlots.HasValue) // guard nếu TotalSlots nullable
        .Select(s => new OccupancyRateDto
        {
            ScheduleId = s.ScheduleId,
            TourId = s.TourId ?? 0,
            TourName = s.Tour != null ? s.Tour.TourName : "N/A",
            DepartureDate = s.DepartureDate ?? DateOnly.MinValue, 
            TotalSlots = s.TotalSlots ?? 0,
            AvailableSlots = s.AvailableSlots,
            BookedSlots = (s.TotalSlots ?? 0) - s.AvailableSlots,
            OccupancyPercent = (s.TotalSlots == null || s.TotalSlots == 0)
                ? 0
                : Math.Round((decimal)((s.TotalSlots ?? 0) - s.AvailableSlots)
                    / s.TotalSlots.Value * 100, 2)
        })
        .OrderBy(s => s.DepartureDate)
        .ToListAsync();
    }
}