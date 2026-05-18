using TravelTourBooking.Common.DTOs;

namespace TravelTourBooking.BLL.Interfaces;

public interface IEmailService
{
    Task<EmailSendResult> SendBookingConfirmationAsync(int bookingId);
    Task<EmailSendResult> SendPaymentSubmittedAsync(
        int bookingId,
        int paymentId,
        decimal amount,
        string paymentMethod,
        string? transactionCode);

    Task<EmailSendResult> SendTestEmailAsync(string toEmail);
}
