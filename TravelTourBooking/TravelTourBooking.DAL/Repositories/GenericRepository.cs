using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TravelTourBooking.DAL.EFCore;
using TravelTourBooking.DAL.Repositories.Interfaces;

namespace TravelTourBooking.DAL.Repositories
{
    public class GenericRepository<T>(AppDbContext db) : IRepository<T> where T : class
    {
        protected readonly AppDbContext _db = db;

        public async Task<IEnumerable<T>> GetAllAsync() =>
            await _db.Set<T>().ToListAsync();

        public async Task<T?> GetByIdAsync(int id) =>
            await _db.Set<T>().FindAsync(id);

        public async Task<T> AddAsync(T entity)
        {
            _db.Set<T>().Add(entity);
            await _db.SaveChangesAsync();
            return entity;
        }

        public async Task UpdateAsync(T entity)
        {
            _db.Set<T>().Update(entity);
            await _db.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await GetByIdAsync(id);
            if (entity is not null)
            {
                _db.Set<T>().Remove(entity);
                await _db.SaveChangesAsync();
            }
        }

        public async Task<bool> ExistsAsync(int id) =>
            await _db.Set<T>().FindAsync(id) is not null;
    }
}
