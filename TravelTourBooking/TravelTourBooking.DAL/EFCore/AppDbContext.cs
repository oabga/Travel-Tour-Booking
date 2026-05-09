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
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.ApplyConfiguration(new TourConfiguration());
            modelBuilder.ApplyConfiguration(new TourScheduleConfiguration());
            
            
            
            modelBuilder.Entity<AccountRole>().HasKey(x => new { x.AccountId, x.RoleId });
            modelBuilder.Entity<AccountRole>().HasOne(x => x.Account).WithMany(x => x.AccountRoles).HasForeignKey(x => x.AccountId);
            modelBuilder.Entity<AccountRole>().HasOne(x => x.Role).WithMany(x => x.AccountRoles).HasForeignKey(x => x.RoleId);
            modelBuilder.Entity<CustomerProfile>().HasKey(x => x.AccountId);
            modelBuilder.Entity<Role>().HasData(
                    new Role { RoleId = 1, RoleName = "Admin" },
                    new Role { RoleId = 2, RoleName = "Staff" },
                    new Role { RoleId = 3, RoleName = "Customer" }
            );

        }
        public DbSet<Account> Accounts { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<AccountRole> AccountRoles { get; set; }
        public DbSet<CustomerProfile> CustomerProfiles { get; set; }
        public DbSet<Review> Review { get; set; }
    }
}
