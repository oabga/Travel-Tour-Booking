using TravelTourBooking.Common.DTOs;

namespace TravelTourBooking.BLL.Interfaces;

public interface IPaymentService
{
    PaymentConfigDto GetPaymentConfig();

    /// <summary>Khách quét MoMo/CK, nhập mã GD — Pending + email đã nhận.</summary>
    Task<SubmitPaymentResultDto> SubmitCustomerPaymentAsync(CreatePaymentDto dto);

    Task<CheckoutPaymentResultDto> CheckoutAsync(CreatePaymentDto dto);

    Task<int> CreateBankTransferAsync(CreatePaymentDto dto);
    Task<int> CreateCashPaymentAsync(CreateCashPaymentDto dto);
    Task<IEnumerable<PaymentDto>> GetPaymentsByBookingAsync(int bookingId);
    Task<ConfirmPaymentResultDto> ConfirmPaymentAsync(int paymentId);
    Task<bool> RefundPaymentAsync(int paymentId);
    Task<decimal> GetTotalPaidAsync(int bookingId);
    Task<decimal> GetRemainingAmountAsync(int bookingId);
}
