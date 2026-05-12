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
    public class DestinationRepository(AppDbContext db)
    : GenericRepository<Destination>(db), IDestinationRepository
    {
        public async Task<bool> NameExistsAsync(string name, int? excludeId = null)
        {
            var query = _db.Destinations.Where(d =>
                d.DesName != null && d.DesName.ToLower() == name.ToLower());

            if (excludeId.HasValue)
                query = query.Where(d => d.DesId != excludeId.Value);

            return await query.AnyAsync();
        }
    }
}
