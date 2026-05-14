using System;
using System.Collections.Generic;

namespace TravelTourBooking.DAL.EFCore.Entities;

public class Account
{
    public int AccountId { get; set; }

    public string Email { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public ICollection<AccountRole> AccountRoles { get; set; }
        = new List<AccountRole>();

    public CustomerProfile? CustomerProfile { get; set; }
}