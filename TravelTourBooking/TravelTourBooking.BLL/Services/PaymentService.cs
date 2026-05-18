using Microsoft.Extensions.Options;
using TravelTourBooking.BLL.Interfaces;
using TravelTourBooking.Common.DTOs;
using TravelTourBooking.Common.Options;
using TravelTourBooking.DAL.EFCore.Entities;
using TravelTourBooking.DAL.Repositories.Interfaces;

namespace TravelTourBooking.BLL.Services;

public class PaymentService : IPaymentService
{
    private readonly IPaymentRepository _paymentRepository;
    private readonly IBookingRepository _bookingRepository;
    private readonly IEmailService _emailService;
    private readonly PaymentSettings _paymentSettings;

    public PaymentService(
        IPaymentRepository paymentRepository,
        IBookingRepository bookingRepository,
        IEmailService emailService,
        IOptions<PaymentSettings> paymentSettings)
    {
        _paymentRepository = paymentRepository;
        _bookingRepository = bookingRepository;
        _emailService = emailService;
        _paymentSettings = paymentSettings.Value;
    }

    public PaymentConfigDto GetPaymentConfig() => new()
    {
        MoMoQrUrl = _paymentSettings.MoMoQrPath,
        MoMoAccountName = _paymentSettings.MoMoAccountName,
        MoMoPhone = _paymentSettings.MoMoPhone,
        BankName = _paymentSettings.BankName,
        BankAccountNumber = _paymentSettings.BankAccountNumber,
        BankAccountName = _paymentSettings.BankAccountName,
        TransferNotePrefix = _paymentSettings.TransferNotePrefix
    };

    public async Task<SubmitPaymentResultDto> SubmitCustomerPaymentAsync(CreatePaymentDto dto)
    {
        await ValidatePaymentAmountAsync(dto);

        if (string.IsNullOrWhiteSpace(dto.TransactionCode))
            throw new ArgumentException("Vui lòng nhập mã giao dịch MoMo/ngân hàng sau khi chuyển tiền.");

        var payment = new Payment
        {
            BookingId = dto.BookingId,
            Amount = dto.Amount,
            PaymentMethod = dto.PaymentMethod ?? "MoMo",
            Status = "Pending",
            TransactionCode = dto.TransactionCode.Trim(),
            PaymentDate = DateTime.Now,
            InvoiceCode = await _paymentRepository.GenerateInvoiceCodeAsync(dto.BookingId)
        };

        var paymentId = await _paymentRepository.CreatePaymentAsync(payment);

        var emailResult = await _emailService.SendPaymentSubmittedAsync(
            dto.BookingId,
            paymentId,
            dto.Amount,
            payment.PaymentMethod!,
            payment.TransactionCode);

        var emailHint = emailResult.Success
            ? " Email thông báo đã gửi tới hộp thư của bạn."
            : $" (Chưa gửi email: {emailResult.Error})";

        return new SubmitPaymentResultDto
        {
            PaymentId = paymentId,
            Status = "Pending",
            EmailSent = emailResult.Success,
            EmailError = emailResult.Error,
            Message =
                "Đã ghi nhận thanh toán. Chúng tôi sẽ xác minh trong 24h và gửi email xác nhận khi hoàn tất." +
                emailHint
        };
    }

    [Obsolete("Dùng SubmitCustomerPaymentAsync cho thanh toán MoMo/CK thật.")]
    public async Task<CheckoutPaymentResultDto> CheckoutAsync(CreatePaymentDto dto)
    {
        var submit = await SubmitCustomerPaymentAsync(dto);
        return new CheckoutPaymentResultDto
        {
            PaymentId = submit.PaymentId,
            BookingConfirmed = false,
            EmailSent = submit.EmailSent,
            RemainingAmount = await GetRemainingAmountAsync(dto.BookingId),
            Message = submit.Message
        };
    }

    public async Task<int> CreateBankTransferAsync(CreatePaymentDto dto)
    {
        await ValidatePaymentAmountAsync(dto);
        if (string.IsNullOrWhiteSpace(dto.TransactionCode))
            throw new ArgumentException("Vui lòng nhập mã giao dịch.");

        var payment = new Payment
        {
            BookingId = dto.BookingId,
            Amount = dto.Amount,
            PaymentMethod = dto.PaymentMethod,
            Status = "Pending",
            TransactionCode = dto.TransactionCode.Trim(),
            PaymentDate = DateTime.Now,
            InvoiceCode = await _paymentRepository.GenerateInvoiceCodeAsync(dto.BookingId)
        };

        var id = await _paymentRepository.CreatePaymentAsync(payment);
        await _emailService.SendPaymentSubmittedAsync(
            dto.BookingId, id, dto.Amount, payment.PaymentMethod!, payment.TransactionCode);
        return id;
    }

    public async Task<int> CreateCashPaymentAsync(CreateCashPaymentDto dto)
    {
        var booking = await _bookingRepository.GetByIdAsync(dto.BookingId)
            ?? throw new Exception("Booking not found");

        if (dto.Amount <= 0)
            throw new Exception("Invalid payment amount");

        var payment = new Payment
        {
            BookingId = dto.BookingId,
            Amount = dto.Amount,
            PaymentMethod = "Cash",
            Status = "Completed",
            TransactionCode = $"CASH-{Guid.NewGuid():N}"[..10],
            PaymentDate = DateTime.Now,
            InvoiceCode = await _paymentRepository.GenerateInvoiceCodeAsync(dto.BookingId)
        };

        var id = await _paymentRepository.CreatePaymentAsync(payment);
        await TryConfirmBookingAndNotifyAsync(dto.BookingId);
        return id;
    }

    public async Task<IEnumerable<PaymentDto>> GetPaymentsByBookingAsync(int bookingId)
    {
        var payments = await _paymentRepository.GetPaymentsByBookingAsync(bookingId);
        return payments.Select(p => new PaymentDto
        {
            PaymentId = p.PaymentId,
            BookingId = p.BookingId,
            Amount = p.Amount,
            PaymentDate = p.PaymentDate,
            PaymentMethod = p.PaymentMethod,
            Status = p.Status,
            InvoiceCode = p.InvoiceCode,
            TransactionCode = p.TransactionCode
        });
    }

    public async Task<ConfirmPaymentResultDto> ConfirmPaymentAsync(int paymentId)
    {
        var payment = await _paymentRepository.GetByIdAsync(paymentId)
            ?? throw new Exception("Payment not found");

        if (payment.Status != "Completed")
        {
            payment.Status = "Completed";
            payment.TransactionCode ??= $"TXN-{DateTime.Now:yyyyMMdd}-{Random.Shared.Next(10000, 99999)}";
            await _paymentRepository.UpdateAsync(payment);
        }

        var (confirmed, emailSent) = await TryConfirmBookingAndNotifyAsync(payment.BookingId);
        var remaining = await GetRemainingAmountAsync(payment.BookingId);

        return new ConfirmPaymentResultDto
        {
            Success = true,
            BookingConfirmed = confirmed,
            EmailSent = emailSent,
            RemainingAmount = remaining,
            Message = confirmed
                ? emailSent
                    ? "Đã xác nhận thanh toán và gửi email xác nhận tour cho khách."
                    : "Đã xác nhận thanh toán. Chưa gửi được email (kiểm tra SMTP)."
                : $"Đã xác nhận payment. Booking còn nợ {remaining:N0} VND."
        };
    }

    public async Task<bool> RefundPaymentAsync(int paymentId)
    {
        var payment = await _paymentRepository.GetByIdAsync(paymentId)
            ?? throw new Exception("Payment not found");

        if (payment.Status != "Completed")
            throw new Exception("Only completed payments can be refunded");

        payment.Status = "Refunded";
        await _paymentRepository.UpdateAsync(payment);
        return true;
    }

    public async Task<decimal> GetTotalPaidAsync(int bookingId)
    {
        var payments = await _paymentRepository.GetPaymentsByBookingAsync(bookingId);
        return payments.Where(p => p.Status == "Completed").Sum(p => p.Amount);
    }

    public async Task<decimal> GetRemainingAmountAsync(int bookingId)
    {
        var payments = await _paymentRepository.GetCompletedPaymentsByBookingAsync(bookingId);
        var totalPaid = payments.Sum(p => p.Amount);
        var booking = await _bookingRepository.GetByIdAsync(bookingId);
        return (booking?.TotalAmount ?? 0m) - totalPaid;
    }

    private async Task ValidatePaymentAmountAsync(CreatePaymentDto dto)
    {
        var booking = await _bookingRepository.GetByIdAsync(dto.BookingId)
            ?? throw new Exception("Booking not found");

        if (booking.Status == "Cancelled")
            throw new Exception("Booking đã bị hủy, không thể thanh toán.");

        if (dto.Amount <= 0)
            throw new Exception("Số tiền không hợp lệ.");

        var remaining = await GetRemainingAmountAsync(dto.BookingId);
        if (remaining <= 0)
            throw new Exception("Booking đã được thanh toán đủ.");

        if (dto.Amount > remaining)
            throw new Exception($"Số tiền vượt quá số còn lại ({remaining:N0} VND).");
    }

    private async Task<(bool Confirmed, bool EmailSent)> TryConfirmBookingAndNotifyAsync(int bookingId)
    {
        var remaining = await GetRemainingAmountAsync(bookingId);
        if (remaining > 0)
            return (false, false);

        var booking = await _bookingRepository.GetByIdAsync(bookingId);
        if (booking is null)
            return (false, false);

        if (booking.Status == "Pending")
        {
            booking.Status = "Confirmed";
            await _bookingRepository.UpdateAsync(booking);
        }

        if (booking.Status is not ("Confirmed" or "Completed"))
            return (false, false);

        var emailResult = await _emailService.SendBookingConfirmationAsync(bookingId);
        return (true, emailResult.Success);
    }
}
