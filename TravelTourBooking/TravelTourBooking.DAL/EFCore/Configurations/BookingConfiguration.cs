using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TravelTourBooking.DAL.EFCore.Entities;

namespace TravelTourBooking.DAL.EFCore.Configurations;

public class BookingConfiguration : IEntityTypeConfiguration<Booking>
{
    public void Configure(EntityTypeBuilder<Booking> builder)
    {
        builder.ToTable("Bookings");

        builder.HasKey(b => b.BookingId);

        builder.Property(b => b.TotalAmount)
               .HasColumnType("decimal(12,2)");

        builder.Property(b => b.DiscountPercent)
               .HasColumnType("decimal(5,2)")
               .HasDefaultValue(0m);

        builder.Property(b => b.BookingDate)
               .HasDefaultValueSql("GETDATE()");

        builder.Property(b => b.Status)
               .HasMaxLength(50)
               .HasDefaultValue("Pending");

        builder.ToTable("Bookings", t =>
        {
            t.HasCheckConstraint("CK_BookingStatus",
                "[Status] IN (N'Pending', N'Confirmed', N'Completed', N'Cancelled')");
            t.HasCheckConstraint("CK_NumberOfPeople", "[NumberOfPeople] > 0");
        });

        builder.HasOne(b => b.Schedule)
               .WithMany(s => s.Bookings)
               .HasForeignKey(b => b.ScheduleId)
               .IsRequired(false)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(b => b.BookingDetails)
               .WithOne(d => d.Booking)
               .HasForeignKey(d => d.BookingId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}

public class BookingDetailConfiguration : IEntityTypeConfiguration<BookingDetail>
{
    public void Configure(EntityTypeBuilder<BookingDetail> builder)
    {
        builder.ToTable("BookingDetails");

        builder.HasKey(d => d.DetailId);

        builder.Property(d => d.IsPrimaryContact)
               .HasDefaultValue(false);

        builder.Property(d => d.PassengerType)
               .HasMaxLength(20)
               .HasDefaultValue("Adult");

        builder.ToTable("BookingDetails", t =>
        {
            t.HasCheckConstraint("CK_PassengerType",
                "[PassengerType] IN (N'Adult', N'Child')");
        });
    }
}
