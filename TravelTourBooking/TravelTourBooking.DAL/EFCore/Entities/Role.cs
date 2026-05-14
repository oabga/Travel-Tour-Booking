using System.Collections.Generic;

namespace TravelTourBooking.DAL.EFCore.Entities;

public class Role
{
    public int RoleId { get; set; }
    public string RoleName { get; set; } = null!;
    public ICollection<AccountRole> AccountRoles { get; set; }
        = new List<AccountRole>();
}