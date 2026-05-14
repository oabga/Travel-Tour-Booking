using Microsoft.Data.SqlClient;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TravelTourBooking.DAL.Repositories
{
    public class AdoTourRepository(string connectionString)
    {
        private readonly string _cs = connectionString;

        // ── Connected Model: sp_SearchTours SqlDataReader ─────────────────
       
        public async Task<DataTable> SearchToursDataTableAsync(
            string? destination, decimal? priceMin, decimal? priceMax, DateTime? date)
        {
            var dt = new DataTable();

            await using var conn = new SqlConnection(_cs);
            await using var cmd = new SqlCommand("sp_SearchTours", conn)
            {
                CommandType = CommandType.StoredProcedure
            };

            cmd.Parameters.AddWithValue("@Destination", (object?)destination ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@PriceMin", (object?)priceMin ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@PriceMax", (object?)priceMax ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@Date", (object?)date ?? DBNull.Value);

            await conn.OpenAsync();
            await using var reader = await cmd.ExecuteReaderAsync();
            dt.Load(reader);

            return dt;
        }

        // ── Disconnected Model: Tours DataSet + SqlDataAdapter ────────────
        
        public DataSet GetToursDataSet()
        {
            var ds = new DataSet("TourCatalog");
            var connStr = _cs;

            using var conn = new SqlConnection(connStr);
            using var adapter = new SqlDataAdapter(
                @"SELECT T.TourId, T.TourName, T.Price, T.DurationDays,
                     T.MaxCapacity, T.Description, T.ImageUrl,
                     C.CateName, D.DesName
              FROM   Tours T
              LEFT JOIN Categories   C ON T.CateId = C.CateId
              LEFT JOIN Destinations D ON T.DesId  = D.DesId
              WHERE  T.IsActive = 1",
                conn);

            adapter.Fill(ds, "Tours");

            // Add schedules table to same DataSet
            using var schedAdapter = new SqlDataAdapter(
                @"SELECT ScheduleId, TourId, DepartureDate, ReturnDate,
                     AvailableSlots, Status
              FROM   TourSchedules
              WHERE  Status = N'Open'",
                conn);

            schedAdapter.Fill(ds, "Schedules");

            // Relate the two tables in-memory
            var toursTable = ds.Tables["Tours"]!;
            var schedsTable = ds.Tables["Schedules"]!;
            ds.Relations.Add("Tour_Schedules",
                toursTable.Columns["TourId"]!,
                schedsTable.Columns["TourId"]!);

            return ds;
        }
    }
}
