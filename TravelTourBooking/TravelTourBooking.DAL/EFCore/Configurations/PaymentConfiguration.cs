using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TravelTourBooking.DAL.EFCore.Entities;

namespace TravelTourBooking.DAL.EFCore.Configurations;

public class PaymentConfiguration
    : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.ToTable("Payments");

        builder.HasKey(p => p.PaymentId);

        builder.Property(p => p.Amount)
            .HasColumnType("decimal(12,2)");

        builder.Property(p => p.PaymentDate)
            .HasDefaultValueSql("GETDATE()");

        builder.Property(p => p.PaymentMethod)
            .HasMaxLength(50);

        builder.Property(p => p.Status)
            .HasMaxLength(50);

        builder.Property(p => p.InvoiceCode)
            .HasMaxLength(50);

        builder.Property(p => p.TransactionCode)
            .HasMaxLength(100);

        builder.ToTable("Payments", t =>
        {
            t.HasCheckConstraint(
                "CK_PaymentMethod",
                "[PaymentMethod] IN (N'VNPay', N'MoMo', N'BankTransfer', N'Cash')");

            t.HasCheckConstraint(
                "CK_PaymentStatus",
                "[Status] IN (N'Pending', N'Completed', N'Failed', N'Refunded')");
        });

        builder.HasOne(p => p.Booking)
            .WithMany()
            .HasForeignKey(p => p.BookingId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}