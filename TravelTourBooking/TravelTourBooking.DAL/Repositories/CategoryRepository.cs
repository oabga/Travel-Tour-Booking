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
    public class CategoryRepository(AppDbContext db)
    : GenericRepository<Category>(db), ICategoryRepository
    {
        public async Task<bool> NameExistsAsync(string name, int? excludeId = null)
        {
            var query = _db.Categories.Where(c =>
                c.CateName.ToLower() == name.ToLower());

            if (excludeId.HasValue)
                query = query.Where(c => c.CateId != excludeId.Value);

            return await query.AnyAsync();
        }
    }
}
