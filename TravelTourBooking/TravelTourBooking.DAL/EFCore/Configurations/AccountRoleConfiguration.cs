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
    public class AccountRoleConfiguration : IEntityTypeConfiguration<AccountRole>
    {
        public void Configure(EntityTypeBuilder<AccountRole> builder)
        {
            builder.HasKey(x => new { x.AccountId, x.RoleId });

            builder.HasOne(x => x.Account)
                   .WithMany(x => x.AccountRoles)
                   .HasForeignKey(x => x.AccountId);

            builder.HasOne(x => x.Role)
                   .WithMany(x => x.AccountRoles)
                   .HasForeignKey(x => x.RoleId);
        }
    }
}
