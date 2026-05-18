using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using TravelTourBooking.BLL.Interfaces;
using TravelTourBooking.Common.Options;

namespace TravelTourBooking.API.Controllers;

[ApiController]
[Route("api/email")]
public class EmailController : ControllerBase
{
  /// <summary>Kiểm tra SMTP đang load (không lộ mật khẩu).</summary>
  [HttpGet("status")]
  [AllowAnonymous]
  public IActionResult Status(
      [FromServices] IOptions<SmtpSettings> smtp,
      [FromServices] IWebHostEnvironment env)
  {
    var s = smtp.Value;
    return Ok(new
    {
      environment = env.EnvironmentName,
      smtpEnabled = s.Enabled,
      smtpHost = s.Host,
      smtpPort = s.Port,
      smtpUser = s.User,
      fromEmail = s.FromEmail,
      hasPassword = !string.IsNullOrWhiteSpace(s.Password)
    });
  }

  /// <summary>Gửi email thử — dùng để kiểm tra Gmail/SMTP.</summary>
  [HttpPost("test")]
  [AllowAnonymous]
  public async Task<IActionResult> SendTest(
      [FromServices] IEmailService emailService,
      [FromQuery] string to)
  {
    if (string.IsNullOrWhiteSpace(to))
      return BadRequest("Thêm query ?to=email-nhan@test.com");

    var result = await emailService.SendTestEmailAsync(to);
    return result.Success ? Ok(result) : BadRequest(result);
  }
}
