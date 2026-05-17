using Microsoft.EntityFrameworkCore;
using TravelTourBooking.BLL.Interfaces;
using TravelTourBooking.Common.DTOs;
using TravelTourBooking.DAL.EFCore;
using TravelTourBooking.DAL.EFCore.Entities;

namespace TravelTourBooking.BLL.Services;
public class AccountService : IAccountService
{
    private readonly AppDbContext _context;

    public AccountService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<CustomerProfile?> GetProfileAsync(
        int accountId)
    {
        return await _context.CustomerProfiles
            .FirstOrDefaultAsync(x =>
                x.AccountId == accountId);
    }

    public async Task<CustomerProfile> UpdateProfileAsync(
        int accountId,
        UpdateProfileDto dto)
    {
        var profile = await _context.CustomerProfiles
            .FirstOrDefaultAsync(x =>
                x.AccountId == accountId);

        if (profile == null)
        {
            throw new Exception("Profile not found");
        }

        profile.FullName = dto.FullName;
        profile.Phone = dto.Phone;
        profile.DateOfBirth = dto.DateOfBirth;
        profile.Address = dto.Address;

        await _context.SaveChangesAsync();

        return profile;
    }

    public async Task<int> GetBookingCountAsync(int accountId, int year)
    {
        var sql = $"SELECT dbo.fn_UserBookingCount({accountId}, {year}) AS Value";
        return await _context.Database.SqlQueryRaw<int>(sql).FirstAsync();
    }

    // ── Danh sách khách hàng — dùng LINQ to Entities (JOIN Accounts + CustomerProfiles) ──
    public async Task<IEnumerable<CustomerListDto>> GetAllCustomersAsync()
    {
        // Lấy tất cả AccountId có role = "Customer" qua LINQ to Entities
        var customerAccountIds = await _context.AccountRoles
            .Include(ar => ar.Role)
            .Where(ar => ar.Role.RoleName == "Customer")
            .Select(ar => ar.AccountId)
            .ToListAsync();

        // JOIN Accounts + CustomerProfiles, filter theo role Customer
        var customers = await _context.Accounts
            .Where(a => customerAccountIds.Contains(a.AccountId))
            .Include(a => a.CustomerProfile)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new CustomerListDto
            {
                AccountId = a.AccountId,
                Email = a.Email,
                FullName = a.CustomerProfile != null ? a.CustomerProfile.FullName : null,
                Phone = a.CustomerProfile != null ? a.CustomerProfile.Phone : null,
                DateOfBirth = a.CustomerProfile != null ? a.CustomerProfile.DateOfBirth : null,
                Address = a.CustomerProfile != null ? a.CustomerProfile.Address : null,
                CreatedAt = a.CreatedAt
            })
            .ToListAsync();

        return customers;
    }
}

