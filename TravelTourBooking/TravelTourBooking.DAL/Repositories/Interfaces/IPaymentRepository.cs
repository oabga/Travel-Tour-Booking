using TravelTourBooking.DAL.EFCore.Entities;

namespace TravelTourBooking.DAL.Repositories.Interfaces;

public interface IPaymentRepository
{
    Task<int> CreatePaymentAsync(Payment payment);

    Task<Payment?> GetByIdAsync(int paymentId);
    Task UpdateAsync(Payment payment);


    Task<IEnumerable<Payment>> GetPaymentsByBookingAsync(int bookingId);

    Task<IEnumerable<Payment>> GetCompletedPaymentsByBookingAsync(int bookingId);

    Task<string> GenerateInvoiceCodeAsync(int bookingId);
}