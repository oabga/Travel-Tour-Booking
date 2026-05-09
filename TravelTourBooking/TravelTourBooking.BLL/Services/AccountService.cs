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
    public async Task<int>GetBookingCountAsync(int accountId,int year)
    {
        var sql =$"SELECT dbo.fn_UserBookingCount({accountId}, {year}) AS Value";
        return await _context.Database.SqlQueryRaw<int>(sql).FirstAsync();
    }
}
