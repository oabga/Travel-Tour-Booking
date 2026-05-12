using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TravelTourBooking.DAL.EFCore;
using TravelTourBooking.DAL.EFCore.Entities;
using TravelTourBooking.DAL.Repositories.Interfaces;

namespace TravelTourBooking.DAL.Repositories
{
    public class ScheduleRepository(AppDbContext db)
    : GenericRepository<TourSchedule>(db), IScheduleRepository
    {
        public async Task<IEnumerable<TourSchedule>> GetByTourAsync(int tourId) =>
            await _db.TourSchedules
                .Include(s => s.Employee)
                .Where(s => s.TourId == tourId)
                .OrderBy(s => s.DepartureDate)
                .ToListAsync();

        public new async Task<IEnumerable<TourSchedule>> GetAllAsync() =>
            await _db.TourSchedules
                .Include(s => s.Tour)
                .Include(s => s.Employee)
                .ToListAsync();

        public new async Task<TourSchedule?> GetByIdAsync(int id) =>
            await _db.TourSchedules
                .Include(s => s.Tour)
                .Include(s => s.Employee)
                .FirstOrDefaultAsync(s => s.ScheduleId == id);
    }
}
