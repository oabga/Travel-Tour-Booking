using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TravelTourBooking.DAL.EFCore.Entities;

namespace TravelTourBooking.DAL.EFCore.Configurations
{
    public class TourScheduleConfiguration : IEntityTypeConfiguration<TourSchedule>
    {
        public void Configure(EntityTypeBuilder<TourSchedule> builder)
        {
            builder.ToTable("TourSchedules");

            builder.HasKey(s => s.ScheduleId);

            builder.Property(s => s.Status).HasDefaultValue("Open");

            builder.ToTable("Schedules", t =>
            {
                t.HasCheckConstraint("CK_ScheduleStatus", "[Status] IN (N'Open', N'Full', N'Cancelled')");

                t.HasCheckConstraint("CK_Date", "[ReturnDate] > [DepartureDate]");

                t.HasCheckConstraint("CK_AvailableSlots", "[AvailableSlots] >= 0");
            });

            builder.HasOne(s => s.Tour)
                   .WithMany(t => t.TourSchedules)
                   .HasForeignKey(s => s.TourId)
                   .IsRequired(false)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(s => s.Employee)
                   .WithMany(e => e.TourSchedules)
                   .HasForeignKey(s => s.EmployeeId)
                   .IsRequired(false)
                   .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
