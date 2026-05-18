using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using TravelTourBooking.BLL.Interfaces;
using TravelTourBooking.Common.DTOs;
using TravelTourBooking.Common.Options;
using TravelTourBooking.DAL.EFCore;
using TravelTourBooking.DAL.EFCore.Entities;
using TravelTourBooking.DAL.Repositories.Interfaces;

namespace TravelTourBooking.BLL.Services;

public class PaymentService : IPaymentService
{
    private readonly IPaymentRepository _paymentRepository;
    private readonly IBookingRepository _bookingRepository;
    private readonly IEmailService _emailService;
    private readonly AppDbContext _dbContext;
    private readonly PaymentSettings _paymentSettings;

    public PaymentService(
        IPaymentRepository paymentRepository,
        IBookingRepository bookingRepository,
        IEmailService emailService,
        AppDbContext dbContext,
        IOptions<PaymentSettings> paymentSettings)
    {
        _paymentRepository = paymentRepository;
        _bookingRepository = bookingRepository;
        _emailService = emailService;
        _dbContext = dbContext;
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
        await EnsureCanSubmitPaymentAsync(dto.BookingId);

        var amountDue = await GetRemainingAmountAsync(dto.BookingId);
        if (amountDue <= 0)
            throw new InvalidOperationException("Booking đã được thanh toán đủ.");

        if (string.IsNullOrWhiteSpace(dto.TransactionCode))
            throw new ArgumentException("Vui lòng nhập mã giao dịch MoMo/ngân hàng sau khi chuyển tiền.");

        if (await HasPendingPaymentAsync(dto.BookingId))
            throw new InvalidOperationException("Đã có giao dịch chờ xác minh. Vui lòng chờ nhân viên duyệt.");

        var payment = new Payment
        {
            BookingId = dto.BookingId,
            Amount = amountDue,
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
            amountDue,
            payment.PaymentMethod!,
            payment.TransactionCode);

        var emailHint = emailResult.Success
            ? " Email thông báo đã gửi tới hộp thư của bạn."
            : $" (Chưa gửi email: {emailResult.Error})";

        return new SubmitPaymentResultDto
        {
            PaymentId = paymentId,
            Status = "Pending",
            AmountExpected = amountDue,
            EmailSent = emailResult.Success,
            EmailError = emailResult.Error,
            Message =
                $"Đã ghi nhận mã giao dịch. Vui lòng chuyển đúng {amountDue:N0} VND — nhân viên sẽ đối chiếu trên MoMo và xác nhận trong 24h." +
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
        await EnsureCanSubmitPaymentAsync(dto.BookingId);
        var amountDue = await GetRemainingAmountAsync(dto.BookingId);
        if (string.IsNullOrWhiteSpace(dto.TransactionCode))
            throw new ArgumentException("Vui lòng nhập mã giao dịch.");

        var payment = new Payment
        {
            BookingId = dto.BookingId,
            Amount = amountDue,
            PaymentMethod = dto.PaymentMethod,
            Status = "Pending",
            TransactionCode = dto.TransactionCode.Trim(),
            PaymentDate = DateTime.Now,
            InvoiceCode = await _paymentRepository.GenerateInvoiceCodeAsync(dto.BookingId)
        };

        var id = await _paymentRepository.CreatePaymentAsync(payment);
        await _emailService.SendPaymentSubmittedAsync(
            dto.BookingId, id, amountDue, payment.PaymentMethod!, payment.TransactionCode);
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

    public async Task<ConfirmPaymentResultDto> ConfirmPaymentAsync(int paymentId, decimal verifiedAmount)
    {
        if (verifiedAmount <= 0)
            throw new ArgumentException("Số tiền thực nhận phải lớn hơn 0.");

        var payment = await _paymentRepository.GetByIdAsync(paymentId)
            ?? throw new Exception("Payment not found");

        if (payment.Status != "Pending")
            throw new InvalidOperationException("Chỉ xác nhận giao dịch đang chờ duyệt.");

        var booking = await _bookingRepository.GetByIdAsync(payment.BookingId)
            ?? throw new Exception("Booking not found");

        payment.Amount = verifiedAmount;

        if (payment.Status != "Completed")
        {
            payment.Status = "Completed";
            payment.TransactionCode ??= $"TXN-{DateTime.Now:yyyyMMdd}-{Random.Shared.Next(10000, 99999)}";
            await _paymentRepository.UpdateAsync(payment);
        }

        var remainingAfter = await GetRemainingAmountAsync(payment.BookingId);
        var bookingTotal = booking.TotalAmount ?? 0m;

        string paymentMatch;
        string message;

        if (remainingAfter > 0)
        {
            paymentMatch = "Underpaid";
            message =
                $"Đã ghi nhận {verifiedAmount:N0} VND. Còn thiếu {remainingAfter:N0} VND — liên hệ khách bổ sung.";
        }
        else if (remainingAfter < 0 || GetTotalPaidSync(booking.BookingId) > bookingTotal)
        {
            var over = Math.Abs(remainingAfter);
            paymentMatch = "Overpaid";
            message =
                over > 0
                    ? $"Đã xác nhận. Khách chuyển thừa khoảng {over:N0} VND — xử lý hoàn tiền thủ công nếu cần."
                    : "Đã xác nhận. Số tiền lớn hơn giá tour — xử lý hoàn tiền thủ công nếu cần.";
        }
        else
        {
            paymentMatch = "Equal";
            message = "Số tiền khớp với giá tour.";
        }

        var (confirmed, emailSent) = await TryConfirmBookingAndNotifyAsync(payment.BookingId);

        if (confirmed)
        {
            message = emailSent
                ? "Đã xác nhận thanh toán đủ và gửi email xác nhận tour cho khách."
                : "Đã xác nhận thanh toán đủ. Chưa gửi được email (kiểm tra SMTP).";
            paymentMatch = "Equal";
        }
        else if (paymentMatch == "Equal" && remainingAfter > 0)
        {
            paymentMatch = "Underpaid";
        }

        return new ConfirmPaymentResultDto
        {
            Success = true,
            BookingConfirmed = confirmed,
            EmailSent = emailSent,
            RemainingAmount = Math.Max(0, remainingAfter),
            PaymentMatch = paymentMatch,
            Message = message
        };
    }

    public async Task<RejectPaymentResultDto> RejectPaymentAsync(int paymentId)
    {
        var payment = await _paymentRepository.GetByIdAsync(paymentId)
            ?? throw new Exception("Payment not found");

        if (payment.Status != "Pending")
            throw new InvalidOperationException("Chỉ từ chối giao dịch đang chờ duyệt.");

        payment.Status = "Failed";
        await _paymentRepository.UpdateAsync(payment);

        return new RejectPaymentResultDto
        {
            Success = true,
            Message =
                "Đã từ chối giao dịch. Khách có thể gửi lại mã giao dịch (trong thời hạn phiên thanh toán nếu còn)."
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

    private decimal GetTotalPaidSync(int bookingId) =>
        _dbContext.Payments
            .Where(p => p.BookingId == bookingId && p.Status == "Completed")
            .Sum(p => p.Amount);

    private async Task EnsureCanSubmitPaymentAsync(int bookingId)
    {
        var booking = await _bookingRepository.GetByIdAsync(bookingId)
            ?? throw new Exception("Booking not found");

        if (booking.Status == "Cancelled")
            throw new Exception("Booking đã bị hủy, không thể thanh toán.");

        if (booking.Status is not "Pending")
            throw new InvalidOperationException("Booking không ở trạng thái chờ thanh toán.");

        if (booking.PaymentDeadlineAt.HasValue && DateTime.Now > booking.PaymentDeadlineAt.Value)
            throw new InvalidOperationException(
                "Đã hết thời gian thanh toán. Chỗ đã được trả — vui lòng đặt tour lại.");

        if (booking.PaymentSessionStartedAt is null)
            throw new InvalidOperationException("Vui lòng mở trang thanh toán để bắt đầu phiên 2 phút.");
    }

    private async Task<bool> HasPendingPaymentAsync(int bookingId) =>
        await _dbContext.Payments.AnyAsync(p => p.BookingId == bookingId && p.Status == "Pending");

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
