using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using TravelTourBooking.BLL.Interfaces;
using TravelTourBooking.Common.DTOs;
using TravelTourBooking.Common.Options;
using TravelTourBooking.DAL.Repositories.Interfaces;

namespace TravelTourBooking.BLL.Services;

public class EmailService : IEmailService
{
    private readonly IBookingRepository _bookingRepo;
    private readonly SmtpSettings _smtp;
    private readonly ILogger<EmailService> _logger;

    public EmailService(
        IBookingRepository bookingRepo,
        IOptions<SmtpSettings> smtp,
        ILogger<EmailService> logger)
    {
        _bookingRepo = bookingRepo;
        _smtp = smtp.Value;
        _logger = logger;
    }

    public Task<EmailSendResult> SendBookingConfirmationAsync(int bookingId) =>
        SendToBookingCustomerAsync(bookingId, BuildConfirmationMessage);

    public Task<EmailSendResult> SendPaymentSubmittedAsync(
        int bookingId,
        int paymentId,
        decimal amount,
        string paymentMethod,
        string? transactionCode) =>
        SendToBookingCustomerAsync(bookingId, detail =>
        {
            var subject = $"[TravelTour] Đã nhận thanh toán booking #{bookingId} — chờ xác nhận";
            var body = $"""
                Xin chào {detail.UserName ?? "Quý khách"},

                Chúng tôi đã nhận thông tin thanh toán của bạn và đang xác minh.

                ── Thông tin thanh toán ──
                Mã payment: #{paymentId}
                Mã booking: #{bookingId}
                Tour: {detail.TourName}
                Số tiền: {amount:N0} VND
                Phương thức: {paymentMethod}
                Mã giao dịch: {transactionCode ?? "(chưa có)"}

                Sau khi nhân viên xác nhận, bạn sẽ nhận email xác nhận đặt tour (thường trong 24h).

                Trân trọng,
                TravelTour Booking
                """;
            return (subject, body);
        });

    public Task<EmailSendResult> SendTestEmailAsync(string toEmail) =>
        SendRawAsync(
            toEmail.Trim(),
            "[TravelTour] Email kiểm tra SMTP",
            "Đây là email thử từ TravelTour Booking. Nếu bạn nhận được mail này, cấu hình SMTP đã hoạt động.");

    private static (string Subject, string Body) BuildConfirmationMessage(BookingDetailViewDto detail)
    {
        var bookingId = detail.BookingId;
        var subject = $"[TravelTour] Xác nhận đặt tour #{bookingId} — {detail.TourName}";
        var body = $"""
            Xin chào {detail.UserName ?? "Quý khách"},

            Thanh toán đã được xác nhận. Đặt tour của bạn đã chính thức được xác nhận!

            ── Thông tin đặt tour ──
            Mã booking: #{bookingId}
            Tour: {detail.TourName}
            Điểm đến: {detail.DesName}
            Ngày đi: {detail.DepartureDate:dd/MM/yyyy}
            Ngày về: {detail.ReturnDate:dd/MM/yyyy}
            Số người: {detail.NumberOfPeople}
            Tổng tiền: {detail.TotalAmount:N0} VND
            Trạng thái: {detail.BookingStatus}

            Vui lòng mang mã booking khi làm thủ tục.

            Trân trọng,
            TravelTour Booking
            """;
        return (subject, body);
    }

    private async Task<EmailSendResult> SendToBookingCustomerAsync(
        int bookingId,
        Func<BookingDetailViewDto, (string Subject, string Body)> buildMessage)
    {
        var detail = await _bookingRepo.GetBookingDetailViewAsync(bookingId);
        var email = detail?.UserEmail;

        if (string.IsNullOrWhiteSpace(email))
            email = await _bookingRepo.GetCustomerEmailByBookingIdAsync(bookingId);

        if (string.IsNullOrWhiteSpace(email))
        {
            return new EmailSendResult
            {
                Success = false,
                Error = "Không tìm thấy email khách hàng cho booking này."
            };
        }

        if (detail is null)
        {
            return await SendRawAsync(
                email.Trim(),
                $"[TravelTour] Thông báo booking #{bookingId}",
                "Bạn có cập nhật từ TravelTour Booking. Vui lòng đăng nhập để xem chi tiết.");
        }

        var (subject, body) = buildMessage(detail);
        return await SendRawAsync(email.Trim(), subject, body);
    }

    private string ResolveSmtpPassword()
    {
        var env = Environment.GetEnvironmentVariable("SMTP_PASSWORD");
        if (!string.IsNullOrWhiteSpace(env))
            return env.Replace(" ", "");
        return (_smtp.Password ?? "").Replace(" ", "");
    }

    private async Task<EmailSendResult> SendRawAsync(string toEmail, string subject, string body)
    {
        if (!_smtp.Enabled)
        {
            return new EmailSendResult
            {
                Success = false,
                Error = "Smtp:Enabled=false. Đặt true trong appsettings.Development.json và khởi động lại API."
            };
        }

        var user = _smtp.User?.Trim();
        var password = ResolveSmtpPassword();
        var from = string.IsNullOrWhiteSpace(_smtp.FromEmail) ? user : _smtp.FromEmail.Trim();

        if (string.IsNullOrWhiteSpace(user) || string.IsNullOrWhiteSpace(password))
        {
            return new EmailSendResult
            {
                Success = false,
                Error =
                    "Thiếu Smtp:User hoặc Smtp:Password. " +
                    "Đặt App Password Gmail bằng lệnh: dotnet user-secrets set \"Smtp:Password\" \"xxxx xxxx xxxx xxxx\" " +
                    "--project TravelTourBooking.API rồi khởi động lại API."
            };
        }

        if (user.Contains("your-email", StringComparison.OrdinalIgnoreCase)
            || password.Contains("YOUR_GMAIL", StringComparison.OrdinalIgnoreCase))
        {
            return new EmailSendResult
            {
                Success = false,
                Error =
                    "SMTP đang dùng cấu hình mẫu (your-email / YOUR_GMAIL). " +
                    "Cập nhật Smtp:User trong appsettings.json và App Password qua user-secrets, rồi khởi động lại API."
            };
        }

        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_smtp.FromName, from));
            message.To.Add(MailboxAddress.Parse(toEmail));
            message.Subject = subject;
            message.Body = new TextPart("plain") { Text = body };

            using var client = new SmtpClient();
            var socketOptions = _smtp.Port switch
            {
                465 => SecureSocketOptions.SslOnConnect,
                587 => SecureSocketOptions.StartTls,
                _ => SecureSocketOptions.Auto
            };

            _logger.LogInformation("Gửi email tới {To} qua {Host}:{Port}...", toEmail, _smtp.Host, _smtp.Port);

            await client.ConnectAsync(_smtp.Host, _smtp.Port, socketOptions);
            await client.AuthenticateAsync(user, password);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            _logger.LogInformation("Đã gửi email thành công tới {To}", toEmail);
            return new EmailSendResult { Success = true };
        }
        catch (AuthenticationException ex)
        {
            _logger.LogError(ex, "SMTP xác thực thất bại.");
            return new EmailSendResult
            {
                Success = false,
                Error =
                    "Gmail từ chối App Password hiện tại. Tạo mật khẩu ứng dụng MỚI tại " +
                    "https://myaccount.google.com/apppasswords (bật xác minh 2 bước trước), " +
                    "cập nhật Smtp:Password rồi khởi động lại API. Không dùng mật khẩu đăng nhập Gmail thường."
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Gửi email thất bại tới {To}.", toEmail);
            return new EmailSendResult
            {
                Success = false,
                Error = ex.Message
            };
        }
    }
}
