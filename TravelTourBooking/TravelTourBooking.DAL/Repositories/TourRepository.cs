using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TravelTourBooking.Common.DTOs;
using TravelTourBooking.DAL.EFCore;
using TravelTourBooking.DAL.EFCore.Entities;
using TravelTourBooking.DAL.Repositories.Interfaces;

namespace TravelTourBooking.DAL.Repositories
{
    public class TourRepository : GenericRepository<Tour>, ITourRepository
    {
        private readonly string _connectionString;

        public TourRepository(AppDbContext db, IConfiguration cfg) : base(db)
        {
            _connectionString = cfg.GetConnectionString("DefaultConnection")!;
        }

        // ── Paged list with filters ──────────
        public async Task<(IEnumerable<Tour> Items, int TotalCount)> GetPagedAsync(
            int page, int pageSize,
            int? cateId, int? desId, int? durationDays,
            decimal? priceMin, decimal? priceMax)
        {
            // Build query — LINQ to Entities
            var query = _db.Tours
                .Include(t => t.Category)
                .Include(t => t.Destination)
                .Include(t => t.Reviews)
                .Where(t => t.IsActive);

            if (cateId.HasValue) query = query.Where(t => t.CateId == cateId.Value);
            if (desId.HasValue) query = query.Where(t => t.DesId == desId.Value);
            if (durationDays.HasValue) query = query.Where(t => t.DurationDays == durationDays.Value);
            if (priceMin.HasValue) query = query.Where(t => t.Price >= priceMin.Value);
            if (priceMax.HasValue) query = query.Where(t => t.Price <= priceMax.Value);

            var total = await query.CountAsync();

            var items = await query
                .OrderByDescending(t => t.TourId)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, total);
        }

        public async Task<Tour?> GetDetailAsync(int tourId) =>
            await _db.Tours
                .Include(t => t.Category)
                .Include(t => t.Destination)
                .Include(t => t.TourSchedules)
                    .ThenInclude(s => s.Employee)
                .Include(t => t.Reviews)
                .FirstOrDefaultAsync(t => t.TourId == tourId && t.IsActive);

        // ── Search sp_SearchTours ─────
        public async Task<IEnumerable<SearchTourResult>> SearchAsync(
            string? destination, decimal? priceMin, decimal? priceMax, DateOnly? date)
        {
            var results = new List<SearchTourResult>();

            await using var conn = new SqlConnection(_connectionString);
            await using var cmd = new SqlCommand("sp_SearchTours", conn)
            {
                CommandType = CommandType.StoredProcedure
            };

            cmd.Parameters.AddWithValue("@Destination", (object?)destination ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@PriceMin", (object?)priceMin ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@PriceMax", (object?)priceMax ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@Date", date.HasValue
                ? (object)date.Value.ToDateTime(TimeOnly.MinValue)
                : DBNull.Value);

            await conn.OpenAsync();
            await using var reader = await cmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                results.Add(new SearchTourResult
                {
                    TourId = reader.GetInt32(reader.GetOrdinal("TourId")),
                    TourName = reader.IsDBNull("TourName") ? null : reader.GetString("TourName"),
                    Price = reader.GetDecimal(reader.GetOrdinal("Price")),
                    DurationDays = reader.GetInt32(reader.GetOrdinal("DurationDays")),
                    MaxCapacity = reader.GetInt32(reader.GetOrdinal("MaxCapacity")),
                    Description = reader.IsDBNull("Description") ? null : reader.GetString("Description"),
                    ImageUrl = reader.IsDBNull("ImageUrl") ? null : reader.GetString("ImageUrl"),
                    DesName = reader.IsDBNull("DesName") ? null : reader.GetString("DesName"),
                    Country = reader.IsDBNull("Country") ? null : reader.GetString("Country"),
                    ScheduleId = reader.GetInt32(reader.GetOrdinal("ScheduleId")),
                    DepartureDate = DateOnly.FromDateTime(reader.GetDateTime(reader.GetOrdinal("DepartureDate"))),
                    ReturnDate = DateOnly.FromDateTime(reader.GetDateTime(reader.GetOrdinal("ReturnDate"))),
                    AvailableSlots = reader.GetInt32(reader.GetOrdinal("AvailableSlots")),
                    ScheduleStatus = reader.IsDBNull("ScheduleStatus") ? null : reader.GetString("ScheduleStatus")
                });
            }

            return results;
        }

        // ── Popular tour vw_PopularTours ────────────────────
        public async Task<IEnumerable<PopularTourResult>> GetPopularAsync()
        {
            var rows = await _db.Database
                .SqlQueryRaw<PopularTourResult>("SELECT * FROM vw_PopularTours ORDER BY TotalBookings DESC, AvgRating DESC")
                .ToListAsync();
            return rows;
        }

        public async Task<IReadOnlyList<int>> GetDistinctDurationDaysAsync() =>
            await _db.Tours
                .Where(t => t.IsActive)
                .Select(t => t.DurationDays)
                .Distinct()
                .OrderBy(d => d)
                .ToListAsync();
    }
}
