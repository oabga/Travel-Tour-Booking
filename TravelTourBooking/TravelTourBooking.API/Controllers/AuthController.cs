using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelTourBooking.BLL.Interfaces;
using TravelTourBooking.Common.DTOs.Auth;

namespace TravelTourBooking.API.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(
            [FromBody] RegisterDto dto)
        {
            var result = await _authService.RegisterAsync(dto);

            return Ok(result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(
            [FromBody] LoginDto dto)
        {
            var result = await _authService.LoginAsync(dto);

            return Ok(result);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("register-staff")]
        public async Task<IActionResult> RegisterStaff([FromBody] CreateStaffDto dto)
        {
            var result = await _authService.CreateStaffAsync(dto);
            return Ok(result);
        }

        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            var accountIdClaim = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(accountIdClaim) || !int.TryParse(accountIdClaim, out int accountId))
                return Unauthorized(new { message = "Không xác định được danh tính" });
            try
            {
                await _authService.ChangePasswordAsync(accountId, dto);
                return Ok(new { message = "Đổi mật khẩu thành công" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}