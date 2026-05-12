using Microsoft.EntityFrameworkCore;
using TravelTourBooking.Common.DTOs;
using TravelTourBooking.DAL.EFCore.Entities;

namespace TravelTourBooking.BLL.Interfaces
{
    public interface IAccountService
    {
        Task<CustomerProfile?> GetProfileAsync( int accountId);
        Task<CustomerProfile> UpdateProfileAsync(int accountId, UpdateProfileDto dto);
        Task<int> GetBookingCountAsync(int accountId, int year);

    }

}