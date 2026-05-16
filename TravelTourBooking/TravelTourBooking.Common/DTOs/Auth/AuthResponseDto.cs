namespace TravelTourBooking.Common.DTOs.Auth;
public class AuthResponseDto
{
    public string Token { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Role { get; set; } = null!;

    public bool RequirePasswordChange { get; set; }
}