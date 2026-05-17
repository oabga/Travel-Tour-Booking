
using TravelTourBooking.Common.DTOs.Auth;

namespace TravelTourBooking.BLL.Interfaces;
public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto);

    Task<AuthResponseDto> LoginAsync(LoginDto dto);

    Task<AuthResponseDto> CreateStaffAsync(CreateStaffDto dto);

    Task<bool> ChangePasswordAsync(int accountId, ChangePasswordDto dto);
}