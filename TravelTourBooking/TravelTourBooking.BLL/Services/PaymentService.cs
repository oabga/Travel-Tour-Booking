using TravelTourBooking.BLL.Interfaces;
using TravelTourBooking.Common.DTOs;
using TravelTourBooking.DAL.EFCore.Entities;
using TravelTourBooking.DAL.Repositories;
using TravelTourBooking.DAL.Repositories.Interfaces;

namespace TravelTourBooking.BLL.Services;

public class PaymentService : IPaymentService
{
    private readonly IPaymentRepository _paymentRepository;
    private readonly IBookingRepository _bookingRepository;


    public PaymentService(IPaymentRepository paymentRepository, IBookingRepository bookingRepository)
    {
        _paymentRepository = paymentRepository;
        _bookingRepository = bookingRepository;
    }


    public async Task<int> CreatePaymentAsync(CreatePaymentDto dto)
    {
        var payment = new Payment
        {
            BookingId = dto.BookingId,
            Amount = dto.Amount,
            PaymentMethod = dto.PaymentMethod,
            Status = dto.Status,
            TransactionCode = dto.TransactionCode,
            PaymentDate = DateTime.Now,

            // TODO:
            // gọi fn_GenerateInvoiceCode sau
            InvoiceCode = $"INV-{DateTime.Now.Year}-TEMP"
        };

        return await _paymentRepository.CreatePaymentAsync(payment);
    }

    public async Task<IEnumerable<PaymentDto>> GetPaymentsByBookingAsync(int bookingId)
    {
        var payments =
            await _paymentRepository.GetPaymentsByBookingAsync(bookingId);

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

    public async Task<decimal> GetTotalPaidAsync(int bookingId)
    {
        var payments =
            await _paymentRepository.GetPaymentsByBookingAsync(bookingId);

        return payments
            .Where(p => p.Status == "Completed")
            .Sum(p => p.Amount);
    }


    public async Task<decimal> GetRemainingAmountAsync(int bookingId)
    {
        var payments = await _paymentRepository.GetCompletedPaymentsByBookingAsync(bookingId);

        var totalPaid = payments.Sum(p => p.Amount);

        // lấy tổng booking
        var booking = await _bookingRepository.GetByIdAsync(bookingId);

        var totalPrice = booking.TotalAmount ?? 0m;

        return totalPrice - totalPaid;
    }
}