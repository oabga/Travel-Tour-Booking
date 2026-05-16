using System.ComponentModel.DataAnnotations;

namespace TravelTourBooking.Common.DTOs.Auth;

public class ChangePasswordDto
{
    [Required(ErrorMessage = "Vui lòng nhập mật khẩu cũ")]
    public string OldPassword { get; set; } = null!;

    [Required(ErrorMessage = "Vui lòng nhập mật khẩu mới")]
    public string NewPassword { get; set; } = null!;
}
