using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TravelTourBooking.DAL.EFCore.Configurations;
using TravelTourBooking.DAL.EFCore.Entities;


namespace TravelTourBooking.DAL.EFCore
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Category> Categories => Set<Category>();
        public DbSet<Destination> Destinations => Set<Destination>();
        public DbSet<Tour> Tours => Set<Tour>();
        public DbSet<TourSchedule> TourSchedules => Set<TourSchedule>();
        public DbSet<Employee> Employees => Set<Employee>();
        public DbSet<Review> Reviews => Set<Review>();
        public DbSet<Booking> Bookings => Set<Booking>();
        public DbSet<BookingDetail> BookingDetails => Set<BookingDetail>();
        public DbSet<TourRevenueView> TourRevenueView { get; set; }
        public DbSet<PopularToursView> PopularToursView { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.ApplyConfiguration(new TourConfiguration());
            modelBuilder.ApplyConfiguration(new TourScheduleConfiguration());
            modelBuilder.ApplyConfiguration(new BookingConfiguration());
            modelBuilder.ApplyConfiguration(new BookingDetailConfiguration());

            modelBuilder.ApplyConfiguration(new AccountRoleConfiguration());
            modelBuilder.ApplyConfiguration(new CustomerProfileConfiguration());
            modelBuilder.ApplyConfiguration(new RoleConfiguration());

            modelBuilder.Entity<TourRevenueView>().HasNoKey().ToView("vw_TourRevenue");
            modelBuilder.Entity<PopularToursView>(entity => {
                entity.HasNoKey();
                entity.ToView("vw_PopularTours");
                entity.Property(e => e.AvgRating).HasColumnType("decimal(3,1)");
            });
            modelBuilder.Entity<TourSchedule>().ToTable("TourSchedules");

            modelBuilder.Entity<TourRevenueView>(entity => {
                entity.HasNoKey();
                entity.ToView("vw_TourRevenue");
                entity.Property(e => e.TotalRevenue).HasColumnType("decimal(18, 2)");
            });

            modelBuilder.Entity<Voucher>(entity =>
            {
                entity.ToTable("Vouchers");
                entity.HasKey(e => e.VoucherId);
                entity.HasIndex(e => e.Code).IsUnique();
                entity.Property(e => e.Code).HasMaxLength(50).IsUnicode(false);
                entity.Property(e => e.DiscountPercent).HasColumnType("decimal(5, 2)");
            });
        }
        public DbSet<Account> Accounts { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<AccountRole> AccountRoles { get; set; }
        public DbSet<CustomerProfile> CustomerProfiles { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Voucher> Vouchers { get; set; }
    }
}
