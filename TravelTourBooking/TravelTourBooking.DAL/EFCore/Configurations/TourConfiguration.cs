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
    public class TourConfiguration : IEntityTypeConfiguration<Tour>
    {
        public void Configure(EntityTypeBuilder<Tour> builder)
        {
            builder.ToTable("Tours");

            builder.HasKey(t => t.TourId);

            builder.Property(t => t.Price)
                   .HasColumnType("decimal(12,2)");

            builder.Property(t => t.IsActive)
                   .HasDefaultValue(true);

            builder.ToTable("Tours", t =>
            {
                t.HasCheckConstraint("CK_Tours_DurationDays", "[DurationDays] > 0");
                t.HasCheckConstraint("CK_Tours_Price", "[Price] > 0");
                t.HasCheckConstraint("CK_Tours_MaxCapacity", "[MaxCapacity] > 0");
            });

            // Category → Tour (one-to-many, nullable FK so tour can exist without category)
            builder.HasOne(t => t.Category)
                   .WithMany(c => c.Tours)
                   .HasForeignKey(t => t.CateId)
                   .IsRequired(false)
                   .OnDelete(DeleteBehavior.SetNull);

            // Destination → Tour
            builder.HasOne(t => t.Destination)
                   .WithMany(d => d.Tours)
                   .HasForeignKey(t => t.DesId)
                   .IsRequired(false)
                   .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
