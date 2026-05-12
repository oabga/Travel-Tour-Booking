using Microsoft.EntityFrameworkCore;
using TravelTourBooking.DAL.EFCore;
using TravelTourBooking.DAL.EFCore.Entities;
using TravelTourBooking.DAL.Repositories.Interfaces;

namespace TravelTourBooking.DAL.Repositories;

public class PaymentRepository : IPaymentRepository
{
    private readonly AppDbContext _context;

    public PaymentRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<int> CreatePaymentAsync(Payment payment)
    {
        await _context.Payments.AddAsync(payment);

        await _context.SaveChangesAsync();

        return payment.PaymentId;
    }

    public async Task<IEnumerable<Payment>> GetCompletedPaymentsByBookingAsync(int bookingId)
    {
        return await _context.Payments
            .Where(p => p.BookingId == bookingId && p.Status == "Completed")
            .ToListAsync();
    }

    public async Task<IEnumerable<Payment>> GetPaymentsByBookingAsync(int bookingId)
    {
        return await _context.Payments
            .Where(p => p.BookingId == bookingId)
            .ToListAsync();
    }

    public async Task<string> GenerateInvoiceCodeAsync(int bookingId)
    {
        var result = await _context
            .Database
            .SqlQuery<string>($"SELECT dbo.fn_GenerateInvoiceCode({bookingId})")
            .ToListAsync();

        return result.FirstOrDefault();
    }


}