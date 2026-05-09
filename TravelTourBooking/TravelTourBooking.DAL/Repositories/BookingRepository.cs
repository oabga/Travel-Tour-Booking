using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Data;
using TravelTourBooking.Common.DTOs;
using TravelTourBooking.DAL.EFCore;
using TravelTourBooking.DAL.EFCore.Entities;
using TravelTourBooking.DAL.Repositories.Interfaces;

namespace TravelTourBooking.DAL.Repositories;

public class BookingRepository : GenericRepository<Booking>, IBookingRepository
{
    private readonly string _connectionString;

    public BookingRepository(AppDbContext db, IConfiguration cfg) : base(db)
    {
        _connectionString = cfg.GetConnectionString("DefaultConnection")!;
    }

    // ── sp_CreateBooking (ADO.NET Connected model) ─────────────────────────
    public async Task<int> CreateBookingSpAsync(
        int accountId, int scheduleId, int numberOfPeople, decimal discountPercent)
    {
        await using var conn = new SqlConnection(_connectionString);
        await using var cmd = new SqlCommand("sp_CreateBooking", conn)
        {
            CommandType = CommandType.StoredProcedure
        };

        cmd.Parameters.AddWithValue("@AccountId", accountId);
        cmd.Parameters.AddWithValue("@ScheduleId", scheduleId);
        cmd.Parameters.AddWithValue("@NumberOfPeople", numberOfPeople);
        cmd.Parameters.AddWithValue("@DiscountPercent", discountPercent);

        await conn.OpenAsync();

        // sp_CreateBooking trả về SELECT SCOPE_IDENTITY() AS NewBookingId
        var result = await cmd.ExecuteScalarAsync();

        if (result is null || result == DBNull.Value)
            throw new InvalidOperationException("Không thể tạo booking.");

        return Convert.ToInt32(result);
    }

    // ── sp_CancelBooking (ADO.NET Connected model) ─────────────────────────
    public async Task CancelBookingSpAsync(int bookingId)
    {
        await using var conn = new SqlConnection(_connectionString);
        await using var cmd = new SqlCommand("sp_CancelBooking", conn)
        {
            CommandType = CommandType.StoredProcedure
        };

        cmd.Parameters.AddWithValue("@BookingId", bookingId);

        await conn.OpenAsync();
        await cmd.ExecuteNonQueryAsync();
    }

    // ── vw_BookingDetails (ADO.NET Disconnected model — DataSet) ───────────
    public async Task<BookingDetailViewDto?> GetBookingDetailViewAsync(int bookingId)
    {
        await using var conn = new SqlConnection(_connectionString);
        var adapter = new SqlDataAdapter(
            "SELECT * FROM vw_BookingDetails WHERE BookingId = @BookingId", conn);
        adapter.SelectCommand!.Parameters.AddWithValue("@BookingId", bookingId);

        var ds = new DataSet();
        await conn.OpenAsync();
        adapter.Fill(ds, "BookingView");

        if (ds.Tables["BookingView"]!.Rows.Count == 0)
            return null;

        var row = ds.Tables["BookingView"]!.Rows[0];

        var dto = new BookingDetailViewDto
        {
            BookingId = (int)row["BookingId"],
            UserName = row["UserName"] is DBNull ? null : (string)row["UserName"],
            UserPhone = row["UserPhone"] is DBNull ? null : (string)row["UserPhone"],
            UserEmail = row["UserEmail"] is DBNull ? null : (string)row["UserEmail"],
            TourName = row["TourName"] is DBNull ? null : (string)row["TourName"],
            DesName = row["DesName"] is DBNull ? null : (string)row["DesName"],
            DepartureDate = row["DepartureDate"] is DBNull ? null : Convert.ToDateTime(row["DepartureDate"]),
            ReturnDate = row["ReturnDate"] is DBNull ? null : Convert.ToDateTime(row["ReturnDate"]),
            NumberOfPeople = (int)row["NumberOfPeople"],
            TotalAmount = row["TotalAmount"] is DBNull ? null : (decimal)row["TotalAmount"],
            DiscountPercent = row["DiscountPercent"] is DBNull ? 0m : (decimal)row["DiscountPercent"],
            BookingStatus = row["BookingStatus"] is DBNull ? null : (string)row["BookingStatus"],
            BookingDate = (DateTime)row["BookingDate"],
            Notes = row["Notes"] is DBNull ? null : (string)row["Notes"]
        };

        // Lấy danh sách hành khách kèm theo
        var passengerAdapter = new SqlDataAdapter(
            "SELECT * FROM BookingDetails WHERE BookingId = @BookingId", conn);
        passengerAdapter.SelectCommand!.Parameters.AddWithValue("@BookingId", bookingId);

        var pds = new DataSet();
        passengerAdapter.Fill(pds, "Passengers");

        foreach (DataRow pr in pds.Tables["Passengers"]!.Rows)
        {
            dto.Passengers.Add(new PassengerResponseDto
            {
                DetailId = (int)pr["DetailId"],
                PassengerName = pr["PassengerName"] is DBNull ? null : (string)pr["PassengerName"],
                PassengerDOB = pr["PassengerDOB"] is DBNull
                    ? null
                    : DateOnly.FromDateTime(Convert.ToDateTime(pr["PassengerDOB"])),
                PassengerPhone = pr["PassengerPhone"] is DBNull ? null : (string)pr["PassengerPhone"],
                IsPrimaryContact = pr["IsPrimaryContact"] is not DBNull && (bool)pr["IsPrimaryContact"],
                PassengerType = pr["PassengerType"] is DBNull ? null : (string)pr["PassengerType"],
                PassengerIdNumber = pr["PassengerIdNumber"] is DBNull ? null : (string)pr["PassengerIdNumber"]
            });
        }

        return dto;
    }

    // ── Get booking with details (LINQ to Entities) ────────────────────────
    public async Task<Booking?> GetWithDetailsAsync(int bookingId) =>
        await _db.Bookings
            .Include(b => b.BookingDetails)
            .Include(b => b.Schedule)
                .ThenInclude(s => s!.Tour)
                    .ThenInclude(t => t!.Destination)
            .FirstOrDefaultAsync(b => b.BookingId == bookingId);

    // ── Booking history by account (LINQ to Entities) ──────────────────────
    public async Task<IEnumerable<BookingHistoryDto>> GetByAccountAsync(int accountId)
    {
        // LINQ to Entities — Include + Select
        var bookings = await _db.Bookings
            .Where(b => b.AccountId == accountId)
            .Include(b => b.Schedule)
                .ThenInclude(s => s!.Tour)
                    .ThenInclude(t => t!.Destination)
            .OrderByDescending(b => b.BookingDate)
            .ToListAsync();

        // LINQ to Objects — projection
        return bookings.Select(b => new BookingHistoryDto
        {
            BookingId = b.BookingId,
            TourName = b.Schedule?.Tour?.TourName,
            DesName = b.Schedule?.Tour?.Destination?.DesName,
            DepartureDate = b.Schedule?.DepartureDate?.ToDateTime(TimeOnly.MinValue),
            NumberOfPeople = b.NumberOfPeople,
            TotalAmount = b.TotalAmount,
            Status = b.Status,
            BookingDate = b.BookingDate
        }).ToList();
    }

    // ── Add passengers ─────────────────────────────────────────────────────
    public async Task AddPassengersAsync(IEnumerable<BookingDetail> details)
    {
        _db.BookingDetails.AddRange(details);
        await _db.SaveChangesAsync();
    }
}
